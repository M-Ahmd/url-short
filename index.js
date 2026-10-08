import express from 'express'
import auth from './src/routes/auth.routes.js'
import urlRouter from './src/routes/url.routes.js'
const app = express()


app.use(express.json())

app.use('/auth', auth)
app.use('/url', urlRouter);

const PORT = 3000

app.listen(PORT, ()=>
{
    console.log(`the app is listing on the port ${PORT}`)
})

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({
        message: "failed",
        error: err.message || "Internal Server Error"
    });
})