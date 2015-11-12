import chai from 'chai'

import Converter from '../src'

const expect = chai.expect

describe('Back', () => {

	it('extracts footnote groups', () => {
		const converter = new Converter

		const result = converter.import(`
			<article>
				<article-meta>
					<fn-group></fn-group>
				</article-meta>
				<body></body>
			</article>
		`)

		const footnoteGroup = result.article[0].back[0].footnoteGroups[0]

		expect(footnoteGroup).to.deep.equal({
			type: 'footnote-group',
			footnotes: []
		})
	})

})