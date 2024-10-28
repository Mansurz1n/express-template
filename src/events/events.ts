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
    

    export const CreateEvent:RequestHandler = (req:Request, res:Response) =>{
        const ptitulo = req.get('nameEvent');
        const pdesc = req.get('descri')
        const pData = req.get('data');
        const pValor = req.get('valor');
        const pHoraini = req.get('HorarioI');
        const pHorarioT = req.get('HorarioT');
        if(ptitulo && pdesc && pData && pValor && pHoraini && pHorarioT){
            const newEvent:events ={
                titulo:ptitulo,
                desc:pdesc,
                data:pData,
                valor:pValor,
                horaini:pHoraini,
                horaterm:pHorarioT
            }
            let valor = parseFloat(newEvent.valor);
            const ID  = async (newEvent:events) =>{
                let conn= await OracleDB.getConnection({
                    user:process.env.USER,
                    password: process.env.SENHA,
                    connectString:process.env.ID
                });
                
                await conn.execute(
                    	`INSERT INTO events VALUES(dbms_random.string('x',16),:titulo,:desc ,:data, :horarioini, :horarioterm,:valor)`,
                        [newEvent.titulo,newEvent.desc,newEvent.data,newEvent.horaini,newEvent.horaterm, valor]
                
                )
                const result = await conn.execute(
                    `Select token FROM events where 
                    nome=:nome and data = :data
                    and valor = :valor and 
                    horarioini = :horarioini
                    and horarioterm=:horarioterm`,
                    [newEvent.titulo, newEvent.data, valor, newEvent.horaini+":00", newEvent.horaterm+":00"]
                )
                await conn.close();
                let linhas = result.rows
                console.dir(linhas,{depth:null});
                return

            }
        }
        
    }
    export namespace MostrarEventos
    {
        
        export const ocoridos:RequestHandler = (req: Request, res: Response)=>
        {
            async () => {
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
                let linhas = result.rows;
                res.send(linhas)
            }
            
        }
        export const nochek:RequestHandler = (req: Request, res: Response)=>
        {
            async () => {
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
                let linhas = result.rows;
                res.send(linhas)
            }
        }
        export const futuros:RequestHandler = (req: Request, res: Response)=>
        {
            async () => {
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
                let linhas = result.rows;
                res.send(linhas)
            }
        }
    }

export const AvaliarEvento:RequestHandler =(req:Request, res:Response) => 
{
    AccountsHandler.loginHandler;
    const a=req.get('funcao');
    if (a){
        res.statusCode = 403;
        res.send('Acesso não permitido.');
    }
    else
    {
        async () => {
            let conn= await OracleDB.getConnection({
            user:process.env.USER,
            password: process.env.SENHA,
            connectString:process.env.ID
            });   
            const result = await conn.execute(
                `Select * FROM events where 
                aprova=NULL`,   
            )
            let linhas = result.outBinds;
            res.send(linhas)


            res.send("Selecione o id que irá aprovar");
            const pRes =res.get('res');
            if(pRes){
                const id = parseInt(pRes) 

                await conn.execute
                (`Update events set aprova='sim' where id=:id`
                [id]
                );
                const result2 = await conn.execute(
                `Select * FROM events where 
                id=:id`
                [id]
                )
                res.send(result2.outBinds)
                await conn.close();
                res.send("Update feito com sucesso")
                res.statusCode = 200
            }else{
                await conn.close();
                res.send("Parametro errado")
                res.statusCode= 403

            }
            }   
        }
        
    }





}