import { DOMParser } from 'xmldom'

import { isString } from './utils'
import { getNodeType } from './dom-utils'

export default class Converter {

	constructor() {
		this.parser = new DOMParser()
		this._bodyNodes = this.initBodyNodes()

		this.result = {}
	}

	initBodyNodes() {
		return {
			'p': (state, child) => {
				return this.paragraphGroup(state, child)
			},
			'sec': (state, child) => {
				return this.section(state, child)
			}
		}
	}

	import(input) {
		let xml = this.convertToXml(input)

		this.article(xml)

		return this.result
	}

	convertToXml(input) {
		return this.parser.parseFromString(input)
	}

	article(xml) {
		let article = xml.getElementsByTagName('article').item(0)

		this.body(article)
	}

	body(article) {
		let body = article.getElementsByTagName('body').item(0)

		Array.prototype.slice.call(body.childNodes).map(this.bodyNode.bind(this))
	}

	bodyNode(node) {
		let type = getNodeType(node)

		console.log(type);
		this._bodyNodes[type].call(this, node)
	}

}