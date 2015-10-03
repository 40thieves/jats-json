import chai from 'chai'

import Converter from '../src'

const expect = chai.expect

const SIMPLE_XML_STRING = `
	<article>
		<body>
			<sec>
				<title>Title</title>
				<p>Lorem ipsum</p>
			</sec>
		</body>
	</article>`

describe('Converter', () => {

	it('can be initialized', () => {
		let converter = new Converter
		expect(converter).to.be.an.instanceOf(Converter)
	})

	it('accepts strings', () => {
		let converter = new Converter

		let fn = () => converter.import(SIMPLE_XML_STRING) // Wrap in fn to prevent immediate invocation
		expect(fn).to.not.throw(Error)
	})

	it('returns an object than can be stringified to JSON', () => {
		let converter = new Converter

		let result = converter.import(SIMPLE_XML_STRING)

		expect(JSON.stringify(result)).to.be.a('string')
	})

	it('returns parsed tree from xml string', () => {
		let converter = new Converter

		let result = converter.import(SIMPLE_XML_STRING)


		expect(result).to.deep.equal({
			type: 'root',
			children: {
				'article': {
					type: 'article',
					children: {
						'body': {
							type: 'body',
							children: {
								'sec': {
									type: 'sec',
									children: {
										'title': {
											type: 'title',
											text: 'Title',
											children: {}
										},
										'p': {
											type: 'p',
											text: 'Lorem ipsum',
											children: {}
										}
									}
								}
							}
						}
					}
				}
			}
		})
	})

})