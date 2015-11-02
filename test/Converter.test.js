import chai from 'chai'

import Converter from '../src'
import ConverterError from '../src/ConverterError'

const expect = chai.expect

const SIMPLE_XML_STRING = `
	<article>
		<article-meta></article-meta>
		<body>
			<sec>
				<title>Title</title>
				<p>Lorem ipsum</p>
			</sec>
		</body>
	</article>`

describe('Converter', () => {

	it('can be initialized', () => {
		const converter = new Converter
		expect(converter).to.be.an.instanceOf(Converter)
	})

	it('accepts strings', () => {
		const converter = new Converter

		const fn = () => converter.import(SIMPLE_XML_STRING) // Wrap in fn to prevent immediate invocation
		expect(fn).to.not.throw(Error)
	})

	it('returns an object than can be stringified to JSON', () => {
		const converter = new Converter

		const result = converter.import(SIMPLE_XML_STRING)

		expect(JSON.stringify(result)).to.be.a('string')
	})

	it('takes exception to xml with no <article>', () => {
		const converter = new Converter

		const fn = () => converter.import('<article-meta><foo>bar</foo></article-meta>')

		expect(fn).to.throw(ConverterError, 'No <article> element')
	})

	it('takes exception to xml with no <article-meta>', () => {
		const converter = new Converter

		const fn = () => converter.import('<article><foo>bar</foo></article>')

		expect(fn).to.throw(ConverterError, 'No <article-meta> element')
	})

	it('returns parsed tree from xml string', () => {
		const converter = new Converter

		const result = converter.import(SIMPLE_XML_STRING)

		expect(result).to.deep.equal({
			type: 'root',
			meta: [
				{
					type: 'article-meta'
				}
			],
			article: [
				{
					type: 'article',
					children: [
						{
							type: 'body',
							children: [
								{
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
							]
						}
					]
				}
			]
		})

		it('parses multiple annotations in a paragraph', () => {
			const converter = new Converter

			const result = converter.import(`
				<article>
					<body>
						<sec>
							<title>Title with <bold>styling</bold></title>
							<p>Lorem <italic>ipsum</italic> dolor sit amet, consectetur <xref ref-type="fig" rid="fig1">
							Figure 1</xref> adipiscing elit. Cras vel accumsan lectus, id hendrerit magna. Donec 
							vehicula dui quis ipsum tempor tincidunt. Quisque adipiscing, nibh at pulvinar feugiat, odio 
							lectus eleifend <ext-link ext-link-type="uri" xlink:href="http://example.com/x.pdf" 
							xmlns:xlink="http://www.w3.org/1999/xlink">felis</ext-link>.</p>
						</sec>
					</body>
				</article>`)

			const paragraph = result.article[0].children[0].children[0].children

			expect(paragraph).to.deep.equal([
				{
					type: 'title',
					children: [
						{
							type: 'text',
							data: 'Title with ',
							children: []
						},
						{
							type: 'bold',
							children: [
								{
									type: 'text',
									data: 'styling',
									children: []
								}
							]
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
							children: [
								{
									type: 'text',
									data: 'ipsum',
									children: []
								}
							]
						},
						{
							type: 'text',
							data: ' dolor sit amet, consectetur ',
							children: []
						},
						{
							type: 'figure_reference',
							target: 'fig1',
							children: [
								{
									type: 'text',
									data: 'Figure 1',
									children: []
								}
							]
						},
						{
							type: 'text',
							data: ' adipiscing elit. Cras vel accumsan lectus, id hendrerit magna. Donec vehicula dui quis ipsum tempor tincidunt. Quisque adipiscing, nibh at pulvinar feugiat, odio lectus eleifend ',
							children: []
						},
						{
							type: 'ext-link',
							url: 'http://example.com/x.pdf',
							children: [
								{
									type: 'text',
									data: 'felis',
									children: []
								}
							]
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

		it('parses nested annotated text', () => {
			const converter = new Converter

			const result = converter.import(`
				<article>
					<body>
						<sec>
							<p>
								Text <bold>with <italic>styling</italic></bold>
							</p>
						</sec>
					</body>
				</article>`)

			const paragraph = result.article[0].children[0].children[0].children // Skip past article/body/sec stuff
			expect(paragraph).to.deep.equal([
				{
					type: 'p',
					children: [
						{
							type: 'text',
							data: 'Text ',
							children: []
						},
						{
							type: 'bold',
							children: [
								{
									type: 'text',
									data: 'with ',
									children: []
								},
								{
									type: 'italic',
									children: [
										{
											type: 'text',
											data: 'styling',
											children: []
										}
									]
								}
							]
						}
					]
				}
			])
		})
	})

})