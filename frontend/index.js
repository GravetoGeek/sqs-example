import aws from 'aws-sdk'
import express from 'express'

aws.config.update({
    region: 'us-east-1'
})

const sqs=new aws.SQS()
const app=express()

const PORT=3000
const pasta=process.env.PWD||'.'

app.use(express.json())

app.post('/solicitar_imagens',async (req,res) => {
    const qtdImagens=parseInt(req.body.qtdImagens)
    console.log('Quantidade de imagens:',qtdImagens)

    try {
        for(let i=0;i<qtdImagens;i++) {
            console.log('Enviando mensagem para a fila SQS...')
            console.log('Mensagem:',i+1)
            sqs.sendMessage({
                MessageBody: "Gerar imagem!",
                QueueUrl: "http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/sqsHello"
            },(err,data) => {
                if(err) {
                    console.error('Erro ao enviar mensagem:',err)
                    return res.status(500).json({erro: 'Erro ao enviar mensagem'})
                }
                console.log('Mensagem enviada:',data.MessageId)
            })
        }
        res.status(200).json({mensagem: 'Mensagens enviadas com sucesso!'})
    } catch(err) {
        console.error('Erro ao enviar mensagem:',err)
        return res.status(500).json({erro: 'Erro ao enviar mensagem'})
    }
}
)

app.use(express.static(pasta))
app.listen(PORT,() => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
    console.log(`Arquivos servidos a partir de ${pasta}`)
}
)