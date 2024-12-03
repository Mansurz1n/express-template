import {Request, RequestHandler, Response} from "express";
import OracleDB from "oracledb"
import { AccountsHandler } from "../accounts/accounts";
import { parse, toDate } from 'date-fns';
import jwt, { JwtPayload } from "jsonwebtoken"; 




export namespace WalletHandler {

    export const getWallet: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        // Verificar se o token de autenticação foi fornecido
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Token não fornecido.' });
            return;
        }
    
        try {
            // Decodificar o token JWT para obter o email do usuário
            const decoded = jwt.verify(token, `${process.env.CHAVE}`) as JwtPayload;
            const email = decoded.email;
    
            // Conectar ao banco de dados Oracle
            const conn = await OracleDB.getConnection({
                user: process.env.USER,
                password: process.env.SENHA,
                connectString: process.env.ID,
            });
    
            // Consultar o saldo da carteira do usuário no banco de dados
            const result = await conn.execute(
                `SELECT carteira FROM accounts WHERE email = :email`,
                [email]
            );
    
            // Fechar a conexão com o banco
            await conn.close();
    
            // Garantir que o TypeScript reconheça o formato de result.rows
            const rows = result.rows as Array<[number]> | undefined;
    
            // Verificar se o saldo foi encontrado
            if (rows && rows.length > 0) {
                const wallet = rows[0][0]; // Primeiro registro, primeira coluna
                res.status(200).json({ balance: wallet });
            } else {
                res.status(404).json({ error: 'Usuário não encontrado.' });
            }
        } catch (err) {
            console.error('Erro ao obter carteira:', err);
            res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    };

    export const addfunds: RequestHandler = async (req: Request, res: Response) => { //Testado e funcionando
        const pValor = req.get('valor');
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Token não fornecido.' });
            return;
        }
    
        
            // Decodificar o token JWT para obter o email do usuário
            const decoded = jwt.verify(token, `${process.env.CHAVE}`) as JwtPayload;
            const pEmail = decoded.email;
            console.dir(pEmail);

        if (!pEmail || !pValor) {
            res.status(400).send("Email ou valor para adicionar estão faltando.");
            return;
        }

        try {
            const conn = await OracleDB.getConnection({
                user:process.env.USER,
                password: process.env.SENHA,
                connectString:process.env.ID
            });


            
            await conn.execute(
                `UPDATE accounts SET carteira = carteira + :carteira WHERE email = :email`,
                {email:pEmail, carteira: parseFloat(pValor) }
            );
            
            await conn.commit();
            await conn.close();

            
            res.status(200).send("Fundos adicionados com sucesso.");
            

            
        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao adicionar fundos.");
        }
    };


    export const betOnEvent: RequestHandler = async (req: Request, res: Response) => {//testado e funfa só n testei umas coisas 
        const pEmail = req.get('email');
        const pValor = req.get('valor');
        const pRes = req.get('res');
        const pId = req.get('id');

        if (!pEmail || !pValor || !pRes || !pId ) {
            res.status(400).send("Parâmetros incompletos.");
            return;
        }

        if(pRes !=='não' && pRes !== 'sim' && pRes !=='nao'){
            res.status(400).send("Resposta indisponivel. Porfavor digitar sim ou nao")
            return
        } 


        try {
            const conn = await OracleDB.getConnection({
                user:process.env.USER,
                password: process.env.SENHA,
                connectString:process.env.ID
            });

            const id = parseInt(pId)

            //Verificando se o id está na lista
            let result1 = await conn.execute(
                `Select id FROM events`,
                )




                if(result1.rows){
                var TemID = false //Posição do id na lista 
                for (var nID in result1.rows){
                    let  row:string  =result1.rows[nID] as string  
                    if(parseInt(row[0])===id){
                        TemID = true
                        break
                    }
                } 



                if(TemID === false){
                    await conn.close();
                    res.status(400).send("Não há um evento com esse id")
                    return
                }
            }

            const result = await conn.execute(
                `Select aprova,fim,valoraposta from events where id=:id`,
                [id]
            )
            console.dir(result.rows)//
            if(result.rows && result.rows.length>0){
                const row:string = result.rows[0] as string; //pegando as informações do evento 

                const aprova:string = row[0] as string;
                const fim:string = row[1] as string;
                const valor:string = row[2] as string;
                
                
              
                
                let date = new Date();

                //if(parse(fim,"yyyy/MM/dd HH:MM",new Date())> date)
                if(toDate(fim)<date)
                {
                    console.dir(fim)
                    res.status(403).send("Prazo de aposta ja acabou.");
                    await conn.close();
                    return
                }
                else if(parseFloat(valor)>parseFloat(pValor)){
                    console.dir(valor)
                    res.status(403).send("Valor não é suficuente para apostar nesse evento");
                    await conn.close();
                    return
                }
                else if(aprova !== 'sim'){
                    console.dir(aprova)
                    res.status(403).send("Evento ainda não disponivel para aposta ou recusado.");
                    await conn.close();
                    return
                }

            const carteira = await conn.execute(
                `SELECT carteira FROM accounts WHERE email = :email`,
                [pEmail]
            )
            console.dir(carteira.rows)
            if(carteira.rows && carteira.rows.length>0){
                const row:string = carteira.rows[0] as string;
                
                const b:string = row[0] as string;

                if (!b || parseFloat(b) < parseFloat(pValor)) {
                    res.status(403).send("Saldo insuficiente.");
                    await conn.close();
                    return;
                }
            }

            await conn.execute(
                `UPDATE accounts SET carteira = carteira - :carteira WHERE email = :email`,
                [parseFloat(pValor),pEmail]
            );
            
            await conn.execute(
                `insert into apostas values (:Id_aposta,:valor,:email,:res)`,
                [id, parseFloat(pValor),pEmail,pRes]

            )
            await conn.commit();

            res.status(200).send("Aposta realizada com sucesso.");
            
            await conn.close();
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao realizar aposta.");
        }
    };

   
    export const withdrawFunds: RequestHandler = async (req: Request, res: Response) => { //Testado e funcionando
        const pValor = req.get('valor');
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Token não fornecido.' });
            return;
        }
    
        
            // Decodificar o token JWT para obter o email do usuário
            const decoded = jwt.verify(token, `${process.env.CHAVE}`) as JwtPayload;
            const pEmail = decoded.email;
            console.dir(pEmail);



        if (!pEmail || !pValor) {
            res.status(400).send("Parâmetros de saque incompletos.");
            return;
        }

        try {
            const conn = await OracleDB.getConnection({
                user:process.env.USER,
                password: process.env.SENHA,
                connectString:process.env.ID
            });

            
         


            //Ve se tem saldo suficiente na carteira
            const carteira = await conn.execute(
                `SELECT carteira FROM accounts WHERE email = :email`,
                [ pEmail ]
            );

            

            if(carteira.rows){

                const row:string = carteira.rows[0] as string;

                const dindin:string = row[0]
                console.dir(dindin)
                if (!dindin || parseFloat(dindin) < parseFloat(pValor)) {
                    res.status(403).send("Saldo insuficiente para saque.")
                    await conn.close()
                    return
                }
            }




            await conn.execute(
                `UPDATE accounts SET carteira = carteira - :carteira WHERE email = :email`,
                [parseFloat(pValor), pEmail] 
            );

            await conn.commit();

            await conn.close();

            res.status(200).send(`Saque realizado com sucesso. Seu saque foi de ${parseFloat(pValor)}`);
            
            
        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao realizar saque.");
        }
    };


    export const finishEvent: RequestHandler = async (req: Request, res: Response) => {//testado e funcionando(parte de identificação)
        const pId = req.get('id');
        const pRes = req.get('res');
        const pEmail = req.get('email');


        if (!pId || !pRes || !pEmail ) {
            res.status(400).send("Parâmetros para encerrar o evento estão incompletos.");
            return;
        }
        

        try {
            const  conn = await OracleDB.getConnection({
                user:process.env.USER,
                password: process.env.SENHA,
                connectString:process.env.ID
            });

            const id = parseInt(pId)


            let result1 = await conn.execute(
                `Select id FROM events`,
                )
                if(result1.rows){
                var TemID = false //Posição do id na lista 
                for (var nID in result1.rows){
                    let  row1:string  =result1.rows[nID] as string  
                    if(parseInt(row1[0])===id){
                        TemID = true
                        break
                    }
                } 
                if(TemID === false){
                    await conn.close();
                    res.status(400).send("Não há um evento com esse id")
                    return
                }
            }
                //Verificando se é o criador
                let result2 = await conn.execute(
                    `Select criador,aprova FROM events where id=:id`,
                    [id]
                )
            
            
                if(result2.rows){
                    let  row:string  =result2.rows[0] as string 
                    if(row[1]!=='sim'){
                        await conn.close();
                        res.status(403).send("Evento já finalizado ou ainda não aberto.");
                        return
                    }
                    else if(row[0]!==pEmail){
                            await conn.close();
                            res.status(400).send("Criador não encontrado")
                            return
                        }

                    }

                    
            
            const ganhadores = await conn.execute(
                `select count(*) from apostas where Id_aposta = :Id_aposta and res = :res`,
                [id, pRes]
            );

            const total = await conn.execute(
                `select count(*) from apostas where Id_aposta = :id_aposta`,
                [id]
            );

            const aprovados = await conn.execute(
                `select email,valor from  apostas where Id_aposta = :id_aposta and res = :res `,
                [id, pRes]
            )



            if(ganhadores.rows && ganhadores.rows.length>0 && aprovados.rows && aprovados.rows.length>0 && total.rows && total.rows.length>0){
                const row:string = ganhadores.rows[0] as string;
                const cont:string = row[0] as string;
                //calculo do ganho valor*perdedores/total
                let vtotal:string = total.rows[0] as string; 
                vtotal=vtotal[0]
                const calc = (parseInt(cont)-parseInt(vtotal))/parseInt(vtotal)

                
                
                for(let a =0;a<parseInt(cont) ;a++){
                    const app:string = aprovados.rows[a] as string;         
                    let Conta:string = app[0] 
                    let valorS:string = app[1]
                    let valor = parseFloat(valorS)
                    valor = valor + (valor*calc) 
                    await conn.execute(
                        `UPDATE accounts
                        SET  carteira = calc_acerto(:valor,carteira) 
                        WHERE email = :email`,
                        [valor, Conta]
                    ) 
                }
                await conn.execute
                    (
                        `Update events set aprova='nao' where id=:id`,
                    [id]
                    );


            }else {
                await conn.close();
                res.status(200).send("Não houve vencedores") 
                return
            }

            await conn.commit();
           
            

            res.status(200).send("Evento encerrado e fundos distribuídos.");
            
            await conn.close();
        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao encerrar o evento.");
        }
    };
}

 