import { DOMParser } from 'xmldom'

import { isString } from './utils'
import { getNodeType } from './dom-utils'

export default class Converter {

	constructor() {
		this.parser = new DOMParser()
		this._bodyNodes = this.initBodyNodes()
		this._annotationNodes = this.initAnnotationNodes()

		this.state = {
			type: 'root',
			children: []
		}
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
			'xref': (node, state) => {
				this.xref(node, state)
			},
			'ext-link': (node, state) => {
				this.extLink(node, state)
			}
		}
	}

	import(input) {
		let xml = this.convertToXml(input)

		this.article(xml, this.state)

		return this.state
	}

	convertToXml(input) {
		return this.parser.parseFromString(input)
	}

	article(xml, state) {
		let node = xml.getElementsByTagName('article').item(0)

		let article = {
			type: 'article',
			children: []
		}

		state.children.push(article)

		this.body(node, article)
	}

	body(article, state) {
		let node = article.getElementsByTagName('body').item(0)

		let body = {
			type: 'body',
			children: []
		}

		state.children.push(body)

		Array.prototype.slice.call(node.childNodes).map(this.bodyNode.bind(this, body))
	}

	bodyNode(state, node) {
		let type = getNodeType(node)

		if (this._bodyNodes[type]) {
			this._bodyNodes[type].call(this, node, state)
		}
	}

	section(node, state) {
		let section = {
			type: 'sec',
			children: []
		}

		state.children.push(section)

		Array.prototype.slice.call(node.childNodes).map(this.bodyNode.bind(this, section))
	}

	title(node, state) {
		let title = {
			type: 'title',
			children: []
		}

		state.children.push(title)

		Array.prototype.slice.call(node.childNodes).map(this.annotatedText.bind(this, title))
	}

	paragraph(node, state) {
		let para = {
			type: 'p',
			children: []
		}

		state.children.push(para)

		Array.prototype.slice.call(node.childNodes).map(this.annotatedText.bind(this, para))
	}

	annotatedText(state, node) {
		let type = getNodeType(node)

		if (this._annotationNodes[type]) {
			this._annotationNodes[type].call(this, node, state)
		}
	}

	text(node, state) {
		let data = node.data
		const TABS_OR_NL = /[\t\n\r]+/g

		data = data.replace(TABS_OR_NL, '')

		if ( ! data) return

		let text = {
			type: 'text',
			data: data,
			children: []
		}

		state.children.push(text)
	}

	italic(node, state) {
		let italic = {
			type: 'italic',
			children: []
		}

		state.children.push(italic)

		Array.prototype.slice.call(node.childNodes).map(this.annotatedText.bind(this, italic))
	}

	bold(node, state) {
		let bold = {
			type: 'bold',
			children: []
		}

		state.children.push(bold)

		Array.prototype.slice.call(node.childNodes).map(this.annotatedText.bind(this, bold))
	}

	xref(node, state) {
		let xref = {
			type: 'xref',
			children: []
		}

		state.children.push(xref)

		Array.prototype.slice.call(node.childNodes).map(this.annotatedText.bind(this, xref))
	}

	extLink(node, state) {
		let extLink = {
			type: 'ext-link',
			children: []
		}

		state.children.push(extLink)

		Array.prototype.slice.call(node.childNodes).map(this.annotatedText.bind(this, extLink))
	}

}