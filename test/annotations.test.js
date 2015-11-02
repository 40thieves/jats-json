import chai from 'chai'

import Converter from '../src'

const expect = chai.expect

describe('Annotations', () => {

	it('parses italic', () => {
		const converter = new Converter

		const result = converter.import(`
			<article>
				<article-meta></article-meta>
				<body>
					<sec>
						<p>Foo <italic>Bar</italic></p>
					</sec>
				</body>
			</article>`)

		const paragraph = result.article[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

		expect(paragraph).to.deep.equal([
			{
				type: 'text',
				data: 'Foo ',
				children: []
			},
			{
				type: 'italic',
				children: [
					{
						type: 'text',
						data: 'Bar',
						children: []
					}
				]
			}
		])
	})

	it('parses bold', () => {
		const converter = new Converter

		const result = converter.import(`
			<article>
				<article-meta></article-meta>
				<body>
					<sec>
						<p>Foo <bold>Bar</bold></p>
					</sec>
				</body>
			</article>`)

		const paragraph = result.article[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

		expect(paragraph).to.deep.equal([
			{
				type: 'text',
				data: 'Foo ',
				children: []
			},
			{
				type: 'bold',
				children: [
					{
						type: 'text',
						data: 'Bar',
						children: []
					}
				]
			}
		])
	})

	it('parses code', () => {
		const converter = new Converter

		const result = converter.import(`
			<article>
				<article-meta></article-meta>
				<body>
					<sec>
						<p>Foo <monospace>Bar</monospace></p>
					</sec>
				</body>
			</article>`)

		const paragraph = result.article[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

		expect(paragraph).to.deep.equal([
			{
				type: 'text',
				data: 'Foo ',
				children: []
			},
			{
				type: 'code',
				children: [
					{
						type: 'text',
						data: 'Bar',
						children: []
					}
				]
			}
		])
	})

	it('parses subscript', () => {
		const converter = new Converter

		const result = converter.import(`
			<article>
				<article-meta></article-meta>
				<body>
					<sec>
						<p>Foo <sub>Bar</sub></p>
					</sec>
				</body>
			</article>`)

		const paragraph = result.article[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

		expect(paragraph).to.deep.equal([
			{
				type: 'text',
				data: 'Foo ',
				children: []
			},
			{
				type: 'subscript',
				children: [
					{
						type: 'text',
						data: 'Bar',
						children: []
					}
				]
			}
		])
	})

	it('parses superscript', () => {
		const converter = new Converter

		const result = converter.import(`
			<article>
				<article-meta></article-meta>
				<body>
					<sec>
						<p>Foo <sup>Bar</sup></p>
					</sec>
				</body>
			</article>`)

		const paragraph = result.article[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

		expect(paragraph).to.deep.equal([
			{
				type: 'text',
				data: 'Foo ',
				children: []
			},
			{
				type: 'superscript',
				children: [
					{
						type: 'text',
						data: 'Bar',
						children: []
					}
				]
			}
		])
	})

	it('parses underline', () => {
		const converter = new Converter

		const result = converter.import(`
			<article>
				<article-meta></article-meta>
				<body>
					<sec>
						<p>Foo <underline>Bar</underline></p>
					</sec>
				</body>
			</article>`)

		const paragraph = result.article[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

		expect(paragraph).to.deep.equal([
			{
				type: 'text',
				data: 'Foo ',
				children: []
			},
			{
				type: 'underline',
				children: [
					{
						type: 'text',
						data: 'Bar',
						children: []
					}
				]
			}
		])
	})

	it('parses xref', () => {
		const converter = new Converter

		const result = converter.import(`
			<article>
				<article-meta></article-meta>
				<body>
					<sec>
						<p>
							<xref ref-type="fig" rid="fig1">Figure 1</xref>
						</p>
					</sec>
				</body>
			</article>`)

		const paragraph = result.article[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

		expect(paragraph).to.deep.equal([
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
			}
		])
	})

	it('parses external links', () => {
		const converter = new Converter

		const result = converter.import(`
			<article>
				<article-meta></article-meta>
				<body>
					<sec>
						<p>
							<ext-link ext-link-type="uri" xlink:href="http://example.com/x.pdf" xmlns:xlink="http://www.w3.org/1999/xlink">Link</ext-link>
						</p>
					</sec>
				</body>
			</article>`)

		const paragraph = result.article[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

		expect(paragraph).to.deep.equal([
			{
				type: 'link',
				url: 'http://example.com/x.pdf',
				children: [
					{
						type: 'text',
						data: 'Link',
						children: []
					}
				]
			}
		])
	})

	
	it('parses uris', () => {
		const converter = new Converter

		const result = converter.import(`
			<article>
				<article-meta></article-meta>
				<body>
					<sec>
						<p>Foo <uri xlink:href="http://example.com/x.pdf">Bar</uri></p>
					</sec>
				</body>
			</article>`)

		const paragraph = result.article[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

		expect(paragraph).to.deep.equal([
			{
				type: 'text',
				data: 'Foo ',
				children: []
			},
			{
				type: 'link',
				url: 'http://example.com/x.pdf',
				children: [
					{
						type: 'text',
						data: 'Bar',
						children: []
					}
				]
			}
		])
	})

	it('parses emails', () => {
		const converter = new Converter

		const result = converter.import(`
			<article>
				<article-meta></article-meta>
				<body>
					<sec>
						<p>
							Foo <email>foo@example.com</email>
							<email><italic>bar@example.com</italic></email>
						</p>
					</sec>
				</body>
			</article>`)

		const paragraph = result.article[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

		expect(paragraph).to.deep.equal([
			{
				type: 'text',
				data: 'Foo ',
				children: []
			},
			{
				type: 'email',
				url: 'mailto:foo@example.com',
				children: [
					{
						type: 'text',
						data: 'foo@example.com',
						children: []
					}
				]
			},
			{
				type: 'email', // No mailto url because immediate child is not a text node
				children: [
					{
						type: 'italic',
						children: [
							{
								type: 'text',
								data: 'bar@example.com',
								children: []
							}
						]
					}
				]
			}
		])
	})

	it('normalises urls in external link metadata', () => {
		const converter = new Converter

		const result = converter.import(`
			<article>
				<article-meta></article-meta>
				<body>
					<sec>
						<p>
							<ext-link ext-link-type="uri" xlink:href="example.com/x.pdf" xmlns:xlink="http://www.w3.org/1999/xlink">Link</ext-link>
						</p>
					</sec>
				</body>
			</article>`)

		const paragraph = result.article[0].children[0].children[0].children[0].children[0] // Skip past article/body/sec/p stuff

		expect(paragraph.url).to.equal('http://example.com/x.pdf')
	})

	it('normalises urls in external link metadata', () => {
		const converter = new Converter

		const result = converter.import(`
			<article>
				<article-meta></article-meta>
				<body>
					<sec>
						<p>
							<ext-link ext-link-type="doi" xlink:href="10.7554/eLife.00299.003">A DOI Link</ext-link>
						</p>
					</sec>
				</body>
			</article>`)

		const paragraph = result.article[0].children[0].children[0].children[0].children[0] // Skip past article/body/sec/p stuff

		expect(paragraph.url).to.equal('http://dx.doi.org/10.7554/eLife.00299.003')
	})

})