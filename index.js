import express from 'express'
import auth from './src/routes/auth.routes.js'
const app = express()


app.use(express.json())

app.use('/auth', auth)


const PORT = 3000


app.listen(PORT, ()=>
{
    console.log(`the app is listing on the port ${PORT}`)
})

