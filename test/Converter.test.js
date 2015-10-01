import chai from 'chai'

import Converter from '../src'

const expect = chai.expect

const SIMPLE_XML_STRING = `
	<article>
		<body>
			<sec>Lorem ipsum</sec>
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

	it.only('returns tree of parsed article', () => {
		let converter = new Converter

		let result = converter.import(SIMPLE_XML_STRING)

		expect(result).to.deep.equal({
			'article': {
				children: [{
					'body': {
						'sec': 'Lorem ipsum'
					}
				}]
			}
		})
	})

})