import { DOMParser } from 'xmldom'

import { isString } from './utils'
import { getNodeType } from './dom-utils'

export default class Converter {

	constructor() {
		this.parser = new DOMParser()
		this._bodyNodes = this.initBodyNodes()

		this.state = {
			type: 'root',
			children: {}
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
			children: {}
		}

		state.children.article = article

		this.body(node, article)
	}

	body(article, state) {
		let node = article.getElementsByTagName('body').item(0)

		let body = {
			type: 'body',
			children: {}
		}

		state.children.body = body

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
			children: {}
		}

		state.children.sec = section

		Array.prototype.slice.call(node.childNodes).map(this.bodyNode.bind(this, section))
	}

	title(node, state) {
		let title = {
			type: 'title',
			text: node.childNodes.item(0).data,
			children: {}
		}

		state.children.title = title
	}

	paragraph(node, state) {
		let para = {
			type: 'p',
			text: node.childNodes.item(0).data,
			children: {}
		}

		state.children.p = para
	}

}