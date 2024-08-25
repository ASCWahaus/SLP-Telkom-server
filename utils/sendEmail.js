import nodemailer from 'nodemailer'
import fs from 'fs'
import ejs from 'ejs'
import htt from 'html-to-text'
import juice from 'juice'

export const sendEmail = (options) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const mailOptions = {
        from : process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        text : options.text,
        html : options.html
    }

    transporter.sendMail(mailOptions, function(err, info){
        if (err) {
            console.log(err)
        } return console.log(info)
    })
}

export const templateEmail = (fileName, emailVar) => {
    
    const pathEmail = `server/utils/${fileName}.html`

    if (pathEmail && fs.existsSync(pathEmail)){
        const readFile = fs.readFileSync(pathEmail, 'utf-8')

        const readVar = ejs.render(readFile, emailVar) //read var

        const toHtml = htt(readVar) //

        const styleHtml = juice(readVar) // split html with css

        return {html:styleHtml, text:toHtml}

    } throw "File not exist.."
}