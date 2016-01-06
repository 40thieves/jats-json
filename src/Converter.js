import { DOMParser } from 'xmldom'
import normaliseUrl from 'normalize-url'

import { autobind } from './utils'
import { getNodeType, mapNodes, mapChildNodes, TEXT_NODE } from './dom-utils'
import ConverterError from './ConverterError'

export default class Converter {

	constructor() {
		this.parser = new DOMParser()
		this._bodyNodes = this.initBodyNodes()
		this._annotationNodes = this.initAnnotationNodes()
		this._footnoteNodes = this.initFootnoteNodes()
	}

	initBodyNodes() {
		return {
			'sec': (node, state) => {
				this.section(node, state)
			},
			'title': (node, state) => {
				this.title(node, state)
			},
			'p': (node, state) => {
				this.paragraph(node, state)
			}
		}
	}

	initAnnotationNodes() {
		return {
			'text': (node, state) => {
				this.text(node, state)
			},
			'italic': (node, state) => {
				this.italic(node, state)
			},
			'bold': (node, state) => {
				this.bold(node, state)
			},
			'monospace': (node, state) => {
				this.code(node, state)
			},
			'sub': (node, state) => {
				this.subscript(node, state)
			},
			'sup': (node, state) => {
				this.superscript(node, state)
			},
			'underline': (node, state) => {
				this.underline(node, state)
			},
			'xref': (node, state) => {
				this.xref(node, state)
			},
			'ext-link': (node, state) => {
				this.extLink(node, state)
			},
			'uri': (node, state) => {
				this.extLink(node, state)
			},
			'email': (node, state) => {
				this.email(node, state)
			}
		}
	}

	initFootnoteNodes() {
		return {
			'title': (node, state) => {
				this.footnoteTitle(node, state)
			},
			'fn': (node, state) => {
				this.footnote(node, state)
			}
		}
	}

	static xrefTypes = {
		'bibr': 'citation_reference',
		'fig': 'figure_reference',
		'table': 'figure_reference',
		'supplementary-material': 'figure_reference',
		'other': 'figure_reference',
		'list': 'definition_reference'
	}

	static contribTypes = {
		'author': 'Author',
		'author non-byline': 'Author',
		'autahor': 'Author',
		'auther': 'Author',
		'editor': 'Editor',
		'guest-editor': 'Guest Editor',
		'group-author': 'Group Author',
		'collab': 'Collaborator',
		'reviewed-by': 'Reviewer',
		'nominated-by': 'Nominator',
		'corresp': 'Corresponding Author',
		'other': 'Other',
		'assoc-editor': 'Associate Editor',
		'associate editor': 'Associate Editor',
		'series-editor': 'Series Editor',
		'contributor': 'Contributor',
		'chairman': 'Chairman',
		'monographs-editor': 'Monographs Editor',
		'contrib-author': 'Contributing Author',
		'organizer': 'Organizer',
		'chair': 'Chair',
		'discussant': 'Discussant',
		'presenter': 'Presenter',
		'guest-issue-editor': 'Guest Issue Editor',
		'participant': 'Participant',
		'translator': 'Translator'
	}

	import(input) {
		const xml = this.convertToXml(input)

		const initialState = {
			type: 'root',
			article: []
		}

		this.article(xml, initialState)

		return initialState
	}

	convertToXml(input) {
		return this.parser.parseFromString(input)
	}

	article(xml, state) {
		const node = xml.getElementsByTagName('article').item(0)

		if ( ! node) throw new ConverterError('No <article> element')

		const article = {
			type: 'article',
			meta: [],
			body: [],
			back: []
		}

		state.article.push(article)

		this.articleMeta(node, article)
		this.body(node, article)
		this.back(node, article)
	}

	articleMeta(xml, state) {
		const node = xml.getElementsByTagName('article-meta')[0]

		if ( ! node) throw new ConverterError('No <article-meta> element')

		const meta = {
			type: 'article-meta',
			contributorGroups: [],
			fundingGroups: []
		}

		state.meta.push(meta)

		this.contribGroup(node, meta)
		this.fundingGroup(node, meta)
	}

	contribGroup(articleMeta, state) {
		const node = articleMeta.getElementsByTagName('contrib-group').item(0)

		if ( ! node) return

		const contribGroup = {
			type: 'contrib-group',
			contributors: [],
			affiliations: []
		}

		state.contributorGroups.push(contribGroup)

		mapChildNodes(node, this.contribNode, contribGroup)
	}

	@autobind
	contribNode(node, state) {
		const type = getNodeType(node)

		if (type === 'contrib') {
			this.contrib(node, state)
		}
		else if (type === 'aff') {
			this.affiliation(node, state)
		}
	}

	contrib(node, state) {
		const contrib = {
			type: 'contributor',
			id: node.getAttribute('id'),
			name: ''
		}

		state.contributors.push(contrib)

		this.contribName(node, contrib)
		this.contribCollab(node, contrib)
		this.contribType(node, contrib)
		this.contribBio(node, contrib)
		this.contribRole(node, contrib)
		this.contribDeceased(node, contrib)
		this.contribOrcid(node, contrib)
		this.contribAffiliations(node, contrib)
	}

	contribName(node, state) {
		const name = node.getElementsByTagName('name').item(0)

		if ( ! name) return

		const surnameEl = name.getElementsByTagName('surname').item(0)
		const givenNamesEl = name.getElementsByTagName('given-names').item(0)
		const suffixEl = name.getElementsByTagName('suffix').item(0)

		const names = []

		if (givenNamesEl) names.push(givenNamesEl.textContent)
		if (surnameEl) names.push(surnameEl.textContent)

		if (suffixEl) {
			state.name = [names.join(' '), suffixEl.textContent].join(', ')
		}
		else {
			state.name = names.join(' ')
		}
	}

	contribCollab(node, state) {
		const collab = node.getElementsByTagName('collab').item(0)

		if ( ! collab) return

		state.name = collab.textContent
	}

	contribType(node, state) {
		const type = node.getAttribute('contrib-type')

		if ( ! type) return

		state.contributor_type = Converter.contribTypes[type]
	}

	contribBio(node, state) {
		const bioEl = node.getElementsByTagName('bio').item(0)

		if ( ! bioEl) return

		const bio = {
			children: []
		}

		state.bio = bio

		mapChildNodes(bioEl, this.annotatedText, bio)

		const image = bioEl.getElementsByTagName('graphic').item(0)
		if (image) state.image = image.getAttribute('xlink:href')
	}

	contribRole(node, state) {
		const role = node.getElementsByTagName('role').item(0)

		if ( ! role) return

		state.role = role.textContent
	}

	contribDeceased(node, state) {
		const deceased = node.getAttribute('deceased')

		if ( ! deceased || deceased !== 'yes') return

		state.deceased = true
	}

	contribOrcid(node, state) {
		const uris = node.getElementsByTagName('uri')
		const orcid = Array.prototype.slice.call(uris).find(u => u.getAttribute('content-type') === 'orcid')

		if ( ! orcid) return

		state.orcid = orcid.getAttribute('xlink:href')
	}

	contribAffiliations(node, state) {
		const xrefs = node.getElementsByTagName('xref')

		const affiliationIds = Array.prototype.slice.call(xrefs)
			.filter(xref => xref.getAttribute('ref-type') === 'aff')
			.map(xref => xref.getAttribute('rid'))

		if ( ! affiliationIds.length) return

		state.affiliations = affiliationIds
	}

	affiliation(node, state) {
		const affiliation = {
			type: 'affiliation',
			id: node.getAttribute('id')
		}

		state.affiliations.push(affiliation)

		this.affiliationLabel(node, affiliation)
		this.affiliationDept(node, affiliation)
		this.affiliationCity(node, affiliation)
		this.affiliationCountry(node, affiliation)
		this.affiliationInstitution(node, affiliation)
	}

	affiliationLabel(node, state) {
		const label = node.getElementsByTagName('label').item(0)

		if ( ! label) return

		state.label = label.textContent
	}

	affiliationDept(node, state) {
		const addrLine = node.getElementsByTagName('addr-line').item(0)
		if ( ! addrLine) return
		const namedContent = addrLine.getElementsByTagName('named-content')

		const dept = Array.prototype.slice.call(namedContent).find(el => el.getAttribute('content-type') === 'department')

		if ( ! dept) return

		state.department = dept.textContent
	}

	affiliationCity(node, state) {
		const addrLine = node.getElementsByTagName('addr-line').item(0)
		if ( ! addrLine) return
		const namedContent = addrLine.getElementsByTagName('named-content')

		const city = Array.prototype.slice.call(namedContent).find(el => el.getAttribute('content-type') === 'city')

		if ( ! city) return

		state.city = city.textContent
	}

	affiliationCountry(node, state) {
		const country = node.getElementsByTagName('country').item(0)

		if ( ! country) return

		state.country = country.textContent
	}

	affiliationInstitution(node, state) {
		const institution = node.getElementsByTagName('institution').item(0)

		if ( ! institution) return

		state.institution = institution.textContent
	}

	fundingGroup(articleMeta, state) {
		const node = articleMeta.getElementsByTagName('funding-group').item(0)

		if ( ! node) return

		mapChildNodes(node, this.fundingGroupNode, state.fundingGroups)
	}

	@autobind
	fundingGroupNode(node, state) {
		const type = getNodeType(node)

		if (type === 'award-group') {
			this.awardGroup(node, state)
		}
	}

	awardGroup(node, state) {
		const awardGroup = {
			type: 'award-group'
		}

		const awardId = node.getElementsByTagName('award-id').item(0)
		const fundingSource = node.getElementsByTagName('funding-source').item(0)

		if (awardId) awardGroup.awardId = awardId.textContent.trim()
		if (fundingSource) awardGroup.fundingSource = fundingSource.textContent.trim()

		state.push(awardGroup)
	}

	body(article, state) {
		const node = article.getElementsByTagName('body').item(0)

		if ( ! node) throw new ConverterError('No <body> element')

		const body = {
			type: 'body',
			children: []
		}

		state.body.push(body)

		mapChildNodes(node, this.bodyNode, body)
	}

	@autobind
	bodyNode(node, state) {
		const type = getNodeType(node)

		if (this._bodyNodes[type]) {
			this._bodyNodes[type].call(this, node, state)
		}
	}

	section(node, state) {
		const section = {
			type: 'sec',
			children: []
		}

		state.children.push(section)

		mapChildNodes(node, this.bodyNode, section)
	}

	title(node, state) {
		const title = {
			type: 'title',
			children: []
		}

		state.children.push(title)

		mapChildNodes(node, this.annotatedText, title)
	}

	paragraph(node, state) {
		const para = {
			type: 'p',
			children: []
		}

		state.children.push(para)

		mapChildNodes(node, this.annotatedText, para)
	}

	@autobind
	annotatedText(node, state) {
		const type = getNodeType(node)

		if (this._annotationNodes[type]) {
			this._annotationNodes[type].call(this, node, state)
		}
	}

	text(node, state) {
		let data = node.data
		const TABS_OR_NL = /[\t\n\r]+/g

		data = data.replace(TABS_OR_NL, '')

		if ( ! data) return

		const text = {
			type: 'text',
			data: data,
			children: []
		}

		state.children.push(text)
	}

	italic(node, state) {
		const italic = {
			type: 'italic',
			children: []
		}

		state.children.push(italic)

		mapChildNodes(node, this.annotatedText, italic)
	}

	bold(node, state) {
		const bold = {
			type: 'bold',
			children: []
		}

		state.children.push(bold)

		mapChildNodes(node, this.annotatedText, bold)
	}

	code(node, state) {
		const code = {
			type: 'code',
			children: []
		}

		state.children.push(code)

		mapChildNodes(node, this.annotatedText, code)
	}

	subscript(node, state) {
		const subscript = {
			type: 'subscript',
			children: []
		}

		state.children.push(subscript)

		mapChildNodes(node, this.annotatedText, subscript)
	}

	superscript(node, state) {
		const superscript = {
			type: 'superscript',
			children: []
		}

		state.children.push(superscript)

		mapChildNodes(node, this.annotatedText, superscript)
	}

	underline(node, state) {
		const underline = {
			type: 'underline',
			children: []
		}

		state.children.push(underline)

		mapChildNodes(node, this.annotatedText, underline)
	}

	xref(node, state) {
		const type = Converter.xrefTypes[node.getAttribute('ref-type')] || 'cross_reference'

		const xref = {
			type: type,
			children: []
		}

		const targetId = node.getAttribute('rid')
		if (targetId) xref.target = targetId

		state.children.push(xref)

		mapChildNodes(node, this.annotatedText, xref)
	}

	extLink(node, state) {
		let url = node.getAttribute('xlink:href')

		const linkType = node.getAttribute('ext-link-type')
		if (linkType.toLowerCase() === 'doi') url = `http://dx.doi.org/${url}`

		const extLink = {
			type: 'link',
			url: normaliseUrl(url),
			children: []
		}

		state.children.push(extLink)

		mapChildNodes(node, this.annotatedText, extLink)
	}

	email(node, state) {
		const email = {
			type: 'email',
			children: []
		}

		const textNode = node.firstChild
		if (textNode && textNode.nodeType === TEXT_NODE) {
			email.url = `mailto:${textNode.data}`
		}

		state.children.push(email)

		mapChildNodes(node, this.annotatedText, email)
	}

	back(node, state) {
		const backEl = node.getElementsByTagName('back').item(0)

		if ( ! backEl) throw new ConverterError('No <back> element')

		const back = {
			type: 'back',
			footnoteGroups: []
		}

		state.back.push(back)

		this.footnoteGroups(backEl, back)
	}

	footnoteGroups(node, state) {
		const nodes = node.getElementsByTagName('fn-group')

		mapNodes(nodes, this.footnoteGroup, state)
	}

	@autobind
	footnoteGroup(node, state) {
		const footnoteGroup = {
			type: 'footnote-group',
			footnotes: []
		}

		state.footnoteGroups.push(footnoteGroup)

		mapChildNodes(node, this.footnotes, footnoteGroup)
	}

	@autobind
	footnotes(node, state) {
		const type = getNodeType(node)

		if (this._footnoteNodes[type]) {
			this._footnoteNodes[type].call(this, node, state)
		}
	}

	footnoteTitle(node, state) {
		const title = node.firstChild

		if ( ! title) return

		state.title = title.textContent
	}

	footnote(node, state) {
		const footnote = {
			type: 'footnote',
			children: []
		}

		const type = node.getAttribute('fn-type')

		switch (type) {
			case 'con':
				footnote.footnoteType = 'contributor'
				break

			case 'conflict':
				footnote.footnoteType = 'conflict'
				break

			case 'present-address':
				footnote.footnoteType = 'present-address'
				break
		}

		state.footnotes.push(footnote)

		const footnoteDescription = node.getElementsByTagName('p').item(0)

		if ( ! footnoteDescription) return

		this.paragraph(footnoteDescription, footnote)
	}

}
