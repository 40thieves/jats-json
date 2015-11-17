function ConverterError(message) {
	this.name = 'ConverterError'
	this.message = message
	this.stack = (new Error()).stack
}

ConverterError.prototype = Object.create(Error.prototype)
ConverterError.prototype.constructor = ConverterError

export default ConverterError
