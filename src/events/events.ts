import {Request, Response, RequestHandler} from "express";
import OracleDB from "oracledb";
import { AccountsHandler } from "../accounts/accounts";



export namespace EventsHandler {
    export type events = {
        titulo:string;
        desc:string;
        data:string;
        valor:string;
        horaini:string;
        horaterm:string;
    }
    

    export const CreateEvent: RequestHandler = async (req: Request, res: Response) => {
        try {
            const ptitulo = req.get('nameEvent');
            const pdesc = req.get('descri');
            const pData = req.get('data');
            const pValor = req.get('valor');
            const pHoraini = req.get('HorarioI');
            const pHorarioT = req.get('HorarioT');

            if (!ptitulo || !pdesc || !pData || !pValor || !pHoraini || !pHorarioT) {
                res.status(400).send("Parâmetros inválidos");
                return;
            }

            const newEvent: events = {
                titulo: ptitulo,
                desc: pdesc,
                data: pData,
                valor: pValor,
                horaini: `${pData} ${pHoraini}`,
                horaterm: `${pData} ${pHorarioT}`
            };

            console.dir(process.env.USER);
            console.dir(process.env.SENHA);
            console.dir(process.env.ID);

            const conn = await OracleDB.getConnection({
                user: process.env.USER,
                password: process.env.SENHA,
                connectString: process.env.ID
            });

            console.dir('Conectou');
            await conn.execute(

                `INSERT INTO events 
                 VALUES (SEQ_events.NEXTVAL, :titulo, :descr, :data, :horaini, :horaterm, :valor, NULL)`,
                [
                    newEvent.titulo,
                    newEvent.desc,
                    newEvent.data,
                    newEvent.horaini,
                    newEvent.horaterm,
                    newEvent.valor
                ]
            );

            await conn.commit();
            await conn.close();

            res.status(200).send("Novo evento adicionado com sucesso.");
        } catch (error) {
            console.error("Erro ao criar evento:", error);
            res.status(500).send("Erro ao criar evento.");
        }
    };

    export namespace MostrarEventos
    {
        
        export const ocoridos:RequestHandler = async (req: Request, res: Response)=>
        {
    
                let conn= await OracleDB.getConnection({
                    user:process.env.USER,
                    password: process.env.SENHA,
                    connectString:process.env.ID
                });   
                const result = await conn.execute(
                    `Select * FROM events where data<CONVERT(date,GETUTCDATE())or
                    (data=CONVERT(date,GETUTCDATE()) and fim<CONVERT(time,GETUTCDATE()));`,   
                )
                await conn.close();
                
                res.json(result.rows)
            
            
        }
        export const nochek:RequestHandler = async (req: Request, res: Response)=>
        {
            
                let conn= await OracleDB.getConnection({
                    user:process.env.USER,
                    password: process.env.SENHA,
                    connectString:process.env.ID
                });   
                const result = await conn.execute(
                    `Select * FROM events where 
                    aprova=NULL`,   
                )
                await conn.close();
                res.json(result.rows)
            
        }
        export const futuros:RequestHandler = async (req: Request, res: Response)=>
        {
            
                let conn= await OracleDB.getConnection({
                    user:process.env.USER,
                    password: process.env.SENHA,
                    connectString:process.env.ID
                });   
                const result = await conn.execute(
                    `Select * FROM events where data>CONVERT(date,GETUTCDATE())or
                    (data=CONVERT(date,GETUTCDATE()) and fim>CONVERT(time,GETUTCDATE()));`,   
                )
                await conn.close();
                res.json(result.rows)
            
        }
    }

    export const AvaliarEvento:RequestHandler = async (req:Request, res:Response) => 
    {
    const pEmail =req.get('email');
    const pPassword = req.get('password');
    const pRes =res.get('res');
    if(pEmail && pPassword){


        const linhas= await AccountsHandler.login(pEmail, pPassword)

        if(linhas===null){
            res.statusCode = 403;
            res.send('Acesso não permitido.');
        }
        else
        {
            let conn= await OracleDB.getConnection({
            user:process.env.USER,
            password: process.env.SENHA,
            connectString:process.env.ID
            });   
            if(!pRes){
            const result = await conn.execute(
                `Select Id, titulo, descr, data_aposta, inicio, fim, valoraposta  FROM events where 
                aprova=NULL`,   
            )
            let linhas = result.rows;
            res.json(linhas)


            console.log("Selecione o id que irá aprovar");
            await conn.close()
            }else{
                const id = parseInt(pRes) 

                await conn.execute
                (
                    `Update events set aprova='sim' where id=:id`,
                [id]
                );


                const result2 = await conn.execute(
                `Select * FROM events where 
                id=:id`,
                [id]
                )
                await conn.commit();
                res.json(result2.outBinds)
                await conn.close();
                
                res.statusCode = 200
                }
            

            
        }
    }else{
        res.send('Faltando Parametros')
    }

    }   


    export const DeleteEvent:RequestHandler = async (req:Request,res:Response)=>{
        const pEmail = req.get('email')
        const pPassword = req.get('password')
        if(pEmail && pPassword){
        const linhas= await AccountsHandler.login(pEmail, pPassword)
        if (linhas===null){
            res.statusCode = 403;
            res.send('Acesso não permitido.');
        }
        else
        {
            const pRes =req.get('res');
                let conn= await OracleDB.getConnection({
                user:process.env.USER,
                password: process.env.SENHA,
                connectString:process.env.ID
                });   
            if(!pRes){
                const result = await conn.execute(
                `Select * FROM events where 
                aprova=NULL`,   
                )
                let linhas = result.rows;
                res.json(linhas)
            }
            else{
 
                const id = parseInt(pRes) 
    
                await conn.execute
                    (`Delete from events where id=:id`,
                    [id]
                    );
                    await conn.commit();
                    await conn.close();
                    res.send("Delete feito com sucesso")
                    res.statusCode = 200
                    }
            }
        }
    }
}