import chai from 'chai'

import Converter from '../src'

const expect = chai.expect

describe('Article Meta', () => {

	it('extracts contributor groups', () => {
		const converter = new Converter

		const result = converter.import(`
			<article>
				<article-meta>
					<contrib-group></contrib-group>
				</article-meta>
				<body></body>
			</article>
		`)

		const contribGroup = result.meta[0].children[0]

		expect(contribGroup).to.deep.equal({
			type: 'contrib-group',
			contributors: [],
			affiliations: []
		})
	})

	describe('Contributors', () => {

		it('extracts contributors', () => {
			const converter = new Converter

			const result = converter.import(`
				<article>
					<article-meta>
						<contrib-group>
							<contrib></contrib>
						</contrib-group>
					</article-meta>
					<body></body>
				</article>
			`)

			const contrib = result.meta[0].children[0].contributors[0]

			expect(contrib).to.deep.equal({
				type: 'contributor',
				id: '',
				name: ''
			})
		})

		it('parses contributor id', () => {
			const converter = new Converter

			const result = converter.import(`
				<article>
					<article-meta>
						<contrib-group>
							<contrib id="author-1234"></contrib>
						</contrib-group>
					</article-meta>
					<body></body>
				</article>
			`)

			const contrib = result.meta[0].children[0].contributors[0]

			expect(contrib).to.deep.equal({
				type: 'contributor',
				id: 'author-1234',
				name: ''
			})
		})

		it('parses contributor names', () => {
			const converter = new Converter

			const result = converter.import(`
				<article>
					<article-meta>
						<contrib-group>
							<contrib>
								<name>
									<surname>Smith</surname>
									<given-names>Ali</given-names>
									<suffix>BSc</suffix>
								</name>
							</contrib>
						</contrib-group>
					</article-meta>
					<body></body>
				</article>
			`)

			const contrib = result.meta[0].children[0].contributors[0]

			expect(contrib).to.deep.equal({
				type: 'contributor',
				id: '',
				name: 'Ali Smith, BSc'
			})
		})

		it('parses contributor collaborators', () => {
			const converter = new Converter

			const result = converter.import(`
				<article>
					<article-meta>
						<contrib-group>
							<contrib>
								<collab>National High Blood Pressure Education Program (US)</collab>
							</contrib>
						</contrib-group>
					</article-meta>
					<body></body>
				</article>
			`)

			const contrib = result.meta[0].children[0].contributors[0]

			expect(contrib).to.deep.equal({
				type: 'contributor',
				id: '',
				name: 'National High Blood Pressure Education Program (US)'
			})
		})

		it('parses contributor type', () => {
			const converter = new Converter

			const result = converter.import(`
				<article>
					<article-meta>
						<contrib-group>
							<contrib contrib-type="author"></contrib>
						</contrib-group>
					</article-meta>
					<body></body>
				</article>
			`)

			const contrib = result.meta[0].children[0].contributors[0]

			expect(contrib).to.deep.equal({
				type: 'contributor',
				id: '',
				name: '',
				contributor_type: 'Author'
			})
		})

		it('parses contributor bio', () => {
			const converter = new Converter

			const result = converter.import(`
				<article>
					<article-meta>
						<contrib-group>
							<contrib>
								<bio>
									Foo <bold>Bar</bold>
								</bio>
							</contrib>
						</contrib-group>
					</article-meta>
					<body></body>
				</article>
			`)

			const contrib = result.meta[0].children[0].contributors[0]

			expect(contrib).to.deep.equal({
				type: 'contributor',
				id: '',
				name: '',
				bio: {
					children: [
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
					]
				}
			})
		})

		it('parses contributor bio', () => {
			const converter = new Converter

			const result = converter.import(`
				<article>
					<article-meta>
						<contrib-group>
							<contrib>
								<bio>
									<graphic xlink:href="http://example.com/image.jpg" />
								</bio>
							</contrib>
						</contrib-group>
					</article-meta>
					<body></body>
				</article>
			`)

			const contrib = result.meta[0].children[0].contributors[0]

			expect(contrib).to.deep.equal({
				type: 'contributor',
				id: '',
				name: '',
				bio: { children: [] },
				image: 'http://example.com/image.jpg'
			})
		})

		it('parses contributor role', () => {
			const converter = new Converter

			const result = converter.import(`
				<article>
					<article-meta>
						<contrib-group>
							<contrib>
								<role>Reviewing editor</role>
							</contrib>
						</contrib-group>
					</article-meta>
					<body></body>
				</article>
			`)

			const contrib = result.meta[0].children[0].contributors[0]

			expect(contrib).to.deep.equal({
				type: 'contributor',
				id: '',
				name: '',
				role: 'Reviewing editor'
			})
		})

		it('parses contributor deceased', () => {
			const converter = new Converter

			const result = converter.import(`
				<article>
					<article-meta>
						<contrib-group>
							<contrib deceased="yes"></contrib>
						</contrib-group>
					</article-meta>
					<body></body>
				</article>
			`)

			const contrib = result.meta[0].children[0].contributors[0]

			expect(contrib).to.deep.equal({
				type: 'contributor',
				id: '',
				name: '',
				deceased: true
			})
		})

		it('parses contributor orcid', () => {
			const converter = new Converter

			const result = converter.import(`
				<article>
					<article-meta>
						<contrib-group>
							<contrib>
								<uri content-type="orcid" xlink:href="http://orcid.org/0000-0002-7361-560X"/>
							</contrib>
						</contrib-group>
					</article-meta>
					<body></body>
				</article>
			`)

			const contrib = result.meta[0].children[0].contributors[0]

			expect(contrib).to.deep.equal({
				type: 'contributor',
				id: '',
				name: '',
				orcid: 'http://orcid.org/0000-0002-7361-560X'
			})
		})

	})

	describe('Affiliations', () => {

		it('extracts affiliations', () => {
			const converter = new Converter

			const result = converter.import(`
				<article>
					<article-meta>
						<contrib-group>
							<aff></aff>
						</contrib-group>
					</article-meta>
					<body></body>
				</article>
			`)

			const affiliation = result.meta[0].children[0].affiliations[0]

			expect(affiliation).to.deep.equal({
				type: 'affiliation',
				id: ''
			})
		})

		it('parses affiliation id', () => {
			const converter = new Converter

			const result = converter.import(`
				<article>
					<article-meta>
						<contrib-group>
							<aff id="aff1"></aff>
						</contrib-group>
					</article-meta>
					<body></body>
				</article>
			`)

			const affiliation = result.meta[0].children[0].affiliations[0]

			expect(affiliation).to.deep.equal({
				type: 'affiliation',
				id: 'aff1'
			})
		})

		it('parses affiliation label', () => {
			const converter = new Converter

			const result = converter.import(`
				<article>
					<article-meta>
						<contrib-group>
							<aff>
								<label>Foo</label>
							</aff>
						</contrib-group>
					</article-meta>
					<body></body>
				</article>
			`)

			const affiliation = result.meta[0].children[0].affiliations[0]

			expect(affiliation).to.deep.equal({
				type: 'affiliation',
				id: '',
				label: 'Foo'
			})
		})

		it('parses affiliation department', () => {
			const converter = new Converter

			const result = converter.import(`
				<article>
					<article-meta>
						<contrib-group>
							<aff>
								<addr-line>
									<named-content content-type="department">Department of Molecular and Cell Biology</named-content>
								</addr-line>
							</aff>
						</contrib-group>
					</article-meta>
					<body></body>
				</article>
			`)

			const affiliation = result.meta[0].children[0].affiliations[0]

			expect(affiliation).to.deep.equal({
				type: 'affiliation',
				id: '',
				department: 'Department of Molecular and Cell Biology'
			})
		})

	})

})