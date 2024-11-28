function errorHandler(statusCode, err, req, res, next) {
    console.error(err.stack); // Log the error to the console for debugging purposes

    // If the response has already been sent, don't send another one
    if (res.headersSent){
        return next(err);
    }

    console.log("ERROR MIDDLEWARE CALLED")

    // Send a JSON response with the error details
    res.status(statusCode || 500).json({
        ok: false,
        message: err.message,
    });
}

module.exports = errorHandler;