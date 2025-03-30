import aws from "aws-sdk"
import fs from 'fs'
import cron from 'node-cron'
import request from 'request'

aws.config.update({
    region: 'us-east-1'
})

const sqs=new aws.SQS()


const gerarImagem=(nomeArquivo) => {
    request('https://cataas.com/cat').pipe(
        fs.createWriteStream(`./imagens/${nomeArquivo}.jpg`)
    ).on('finish',() => {
        console.log('Imagem gerada:',nomeArquivo)
    }
    ).on('error',(err) => {
        console.error('Erro ao gerar imagem:',err)
    }
    ).on('close',() => {
        console.log('Imagem fechada:',nomeArquivo)
    })
}



const processarMensagem=async (mensagem) => {
    sqs.receiveMessage({
        MaxNumberOfMessages: 10,
        QueueUrl: "http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/sqsHello",
        WaitTimeSeconds: 5
    },(err,data) => {
        if(err) {
            console.error('Erro ao receber mensagem:',err)
            return
        }
        if(data.Messages) {
            console.log('Mensagens recebidas:',data.Messages.length)
            data.Messages.forEach(element => {
                gerarImagem(element.MessageId)
                sqs.deleteMessage({
                    QueueUrl: "http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/sqsHello",
                    ReceiptHandle: element.ReceiptHandle
                },(err,data) => {
                    if(err) {
                        console.error('Erro ao deletar mensagem:',err)
                        return
                    }
                    console.log('Mensagem deletada:',data)
                })
            })
        }
    })
}

cron.schedule('2 * * * *',() => {
    console.log('Executando tarefa agendada a cada 1 minutos')
    processarMensagem()
}
)
