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

const ANNOTATED_TEXT_XML_STRING = `
		<article>
			<body>
				<sec>
					<title>Title</title>
					<p>Lorem <italic>ipsum</italic> dolor sit amet, consectetur <xref ref-type="fig" rid="fig1">
					Figure 1</xref> adipiscing elit. Cras vel accumsan lectus, id hendrerit magna. Donec 
					vehicula dui quis ipsum tempor tincidunt. Quisque adipiscing, nibh at pulvinar feugiat, odio 
					lectus eleifend <ext-link ext-link-type="uri" xlink:href="http://example.com/x.pdf" 
					xmlns:xlink="http://www.w3.org/1999/xlink">felis</ext-link>.</p>
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
									children: [
										{
											type: 'title',
											children: [
												{
													type: 'text',
													data: 'Title',
													children: []
												}
											]
										},
										{
											type: 'p',
											children: [
												{
													type: 'text',
													data: 'Lorem ipsum',
													children: []
												}
											]
										}
									]
								}
							}
						}
					}
				}
			}
		})
	})

	it('parses annotated text', () => {
		let converter = new Converter

		let result = converter.import(ANNOTATED_TEXT_XML_STRING)

		let para = result.children.article.children.body.children.sec.children

		expect(para).to.deep.equal([
			{
				type: 'title',
				children: [
					{
						type: 'text',
						data: 'Title',
						children: []
					}
				]
			},
			{
				type: 'p',
				children: [
					{
						type: 'text',
						data: 'Lorem ',
						children: []
					},
					{
						type: 'italic',
						children: []
					},
					{
						type: 'text',
						data: ' dolor sit amet, consectetur ',
						children: []
					},
					{
						type: 'xref',
						children: []
					},
					{
						type: 'text',
						data: ' adipiscing elit. Cras vel accumsan lectus, id hendrerit magna. Donec vehicula dui quis ipsum tempor tincidunt. Quisque adipiscing, nibh at pulvinar feugiat, odio lectus eleifend ',
						children: []
					},
					{
						type: 'ext-link',
						children: []
					},
					{
						type: 'text',
						data: '.',
						children: []
					}
				]
			}
		])
	})

})