import chai from 'chai'

import Converter from '../src'

const expect = chai.expect

describe('Annotations', () => {

	it('parses italic', () => {
		let converter = new Converter

		let result = converter.import(`
			<article>
				<body>
					<sec>
						<p>Foo <italic>Bar</italic></p>
					</sec>
				</body>
			</article>`)

		let paragraph = result.children[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

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
		let converter = new Converter

		let result = converter.import(`
			<article>
				<body>
					<sec>
						<p>Foo <bold>Bar</bold></p>
					</sec>
				</body>
			</article>`)

		let paragraph = result.children[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

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
		let converter = new Converter

		let result = converter.import(`
			<article>
				<body>
					<sec>
						<p>Foo <monospace>Bar</monospace></p>
					</sec>
				</body>
			</article>`)

		let paragraph = result.children[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

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
		let converter = new Converter

		let result = converter.import(`
			<article>
				<body>
					<sec>
						<p>Foo <sub>Bar</sub></p>
					</sec>
				</body>
			</article>`)

		let paragraph = result.children[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

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
		let converter = new Converter

		let result = converter.import(`
			<article>
				<body>
					<sec>
						<p>Foo <sup>Bar</sup></p>
					</sec>
				</body>
			</article>`)

		let paragraph = result.children[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

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
		let converter = new Converter

		let result = converter.import(`
			<article>
				<body>
					<sec>
						<p>Foo <underline>Bar</underline></p>
					</sec>
				</body>
			</article>`)

		let paragraph = result.children[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

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
		let converter = new Converter

		let result = converter.import(`
			<article>
				<body>
					<sec>
						<p>
							<xref ref-type="fig" rid="fig1">Figure 1</xref>
						</p>
					</sec>
				</body>
			</article>`)

		let paragraph = result.children[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

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
		let converter = new Converter

		let result = converter.import(`
			<article>
				<body>
					<sec>
						<p>
							<ext-link ext-link-type="uri" xlink:href="http://example.com/x.pdf" xmlns:xlink="http://www.w3.org/1999/xlink">Link</ext-link>
						</p>
					</sec>
				</body>
			</article>`)

		let paragraph = result.children[0].children[0].children[0].children[0].children // Skip past article/body/sec/p stuff

		expect(paragraph).to.deep.equal([
			{
				type: 'ext-link',
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

	it('normalises urls in external link metadata', () => {
		let converter = new Converter

		let result = converter.import(`
			<article>
				<body>
					<sec>
						<p>
							<ext-link ext-link-type="uri" xlink:href="example.com/x.pdf" xmlns:xlink="http://www.w3.org/1999/xlink">Link</ext-link>
						</p>
					</sec>
				</body>
			</article>`)

		let paragraph = result.children[0].children[0].children[0].children[0].children[0] // Skip past article/body/sec/p stuff

		expect(paragraph.url).to.equal('http://example.com/x.pdf')
	})

	it('normalises urls in external link metadata', () => {
		let converter = new Converter

		let result = converter.import(`
			<article>
				<body>
					<sec>
						<p>
							<ext-link ext-link-type="doi" xlink:href="10.7554/eLife.00299.003">A DOI Link</ext-link>
						</p>
					</sec>
				</body>
			</article>`)

		let paragraph = result.children[0].children[0].children[0].children[0].children[0] // Skip past article/body/sec/p stuff

		expect(paragraph.url).to.equal('http://dx.doi.org/10.7554/eLife.00299.003')
	})

})