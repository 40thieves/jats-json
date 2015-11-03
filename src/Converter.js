import { DOMParser } from 'xmldom'
import normaliseUrl from 'normalize-url'

import { isString, autobind } from './utils'
import { getNodeType, mapChildNodes, TEXT_NODE } from './dom-utils'
import ConverterError from './ConverterError'

export default class Converter {

	constructor() {
		this.parser = new DOMParser()
		this._bodyNodes = this.initBodyNodes()
		this._annotationNodes = this.initAnnotationNodes()
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

	static xrefTypes = {
		'bibr': 'citation_reference',
		'fig': 'figure_reference',
		'table': 'figure_reference',
		'supplementary-material': 'figure_reference',
		'other': 'figure_reference',
		'list': 'definition_reference',
	  }

	import(input) {
		const xml = this.convertToXml(input)

		const initialState = {
			type: 'root',
			article: [],
			meta: []
		}

		this.articleMeta(xml, initialState)
		this.article(xml, initialState)

		return initialState
	}

	convertToXml(input) {
		return this.parser.parseFromString(input)
	}

	articleMeta(xml, state) {
		const node = xml.getElementsByTagName('article-meta')[0]

		if ( ! node) throw new ConverterError('No <article-meta> element')

		const meta = {
			type: 'article-meta',
			children: []
		}

		state.meta.push(meta)

		this.contribGroup(node, meta)
	}

	contribGroup(articleMeta, state) {
		const node = articleMeta.getElementsByTagName('contrib-group').item(0)

		if ( ! node) return

		const contribGroup = {
			type: 'contrib-group',
			contributors: []
		}

		state.children.push(contribGroup)

		mapChildNodes(node, this.contrib, contribGroup)
	}

	@autobind
	contrib(node, state) {
		const type = getNodeType(node)

		if (type != 'contrib') return

		const contrib = {
			type: 'contributor'
		}

		state.contributors.push(contrib)

		this.contribName(node, contrib)

		// mapChildNodes(name, this.contribName, contrib)
	}

	contribName(node, state) {
		const name = node.getElementsByTagName('name').item(0)

		if ( ! name) return

		const surname = name.getElementsByTagName('surname').item(0)
		const givenNames = name.getElementsByTagName('given-names').item(0)

		state.name = {}

		if (surname) state.name.surname = surname.childNodes.item(0).data
		if (givenNames) state.name.givenNames = givenNames.childNodes.item(0).data
	}

	article(xml, state) {
		const node = xml.getElementsByTagName('article').item(0)

		if ( ! node) throw new ConverterError('No <article> element')

		const article = {
			type: 'article',
			children: []
		}

		state.article.push(article)

		this.body(node, article)
	}

	body(article, state) {
		const node = article.getElementsByTagName('body').item(0)

		if ( ! node) throw new ConverterError('No <body> element')

		const body = {
			type: 'body',
			children: []
		}

		state.children.push(body)

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

		let linkType = node.getAttribute('ext-link-type')
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

}