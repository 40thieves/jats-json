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
			contributors: []
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
				type: 'contributor'
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
				name: {
					surname: 'Smith',
					givenNames: 'Ali'
				}
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
				contributor_type: 'Author'
			})
		})

	})

})