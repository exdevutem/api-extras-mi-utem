class CustomError extends Error {
    constructor(data, message, statusCode, internalCode) {
      super(data);
      this.data = data;
      this.message = message ? message : "Error inesperado";
      this.statusCode = statusCode ? statusCode : 500;
      this.internalCode = internalCode ? internalCode : 0;
    }


}

module.exports = CustomError;