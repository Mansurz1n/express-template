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
            const conn = await OracleDB.getConnection({
                user: process.env.USER,
                password: process.env.SENHA,
                connectString: process.env.ID
            });

            console.dir('Conectou');
            await conn.execute(

                `INSERT INTO events 
                VALUES (SEQ_events.NEXTVAL, :titulo, :descr, :data, :horaini, :horaterm, :valor, 'pen')`,
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
        export async function selectApostaPen() { 
            let conn= await OracleDB.getConnection({
                user:process.env.USER,
                password: process.env.SENHA,
                connectString:process.env.ID
            }); 

            const result = await conn.execute(
           `Select Id, titulo, descr, data_aposta, inicio, fim, valoraposta  FROM events where 
           aprova='pen'`,   
            )
            let linhas = result.rows;
            await conn.close();
            return linhas
            
        }
   
        export const nochek:RequestHandler = async (req: Request, res: Response)=>
        {
            
            res.json(selectApostaPen)
            
        }
        export const futuros:RequestHandler = async (req: Request, res: Response)=>
        {
            
                let conn= await OracleDB.getConnection({
                    user:process.env.USER,
                    password: process.env.SENHA,
                    connectString:process.env.ID
                });   
                const result = await conn.execute(
                    `Select Id, titulo, descr, data_aposta, inicio, fim, valoraposta FROM events where data>CONVERT(date,GETUTCDATE())or
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
    const pId =res.get('id');
    const pRes = res.get('res');
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
            if(!pId){
                await conn.close();
                console.log("Selecione o id que irá aprovar");
                res.redirect(300,'localhost:3000/events/nochek')
            }else{
                
                const id = parseInt(pId) 
                if(!pRes && pRes==='sim' || pRes === 'nao'){
                await conn.execute
                (
                    `Update events set aprova=:aprova where id=:id`,
                [pRes,id]
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
                }else{
                    res.send('Resposta errada ou não encontrada. Por favor digitar sim ou nao')
                    res.statusCode = 400
                    await conn.close();
                }
            }
            

            
        }
    }else{
        res.send('Faltando Parametros')
    }

    }   


    export const DeleteEvent:RequestHandler = async (req:Request,res:Response)=>{
        const pEmail = req.get('email')
        const pPassword = req.get('password')
        const pId = req.get('id')
        if(pEmail && pPassword && pId){
        const linhas= await AccountsHandler.login(pEmail, pPassword)
        if (linhas===null){
            res.statusCode = 403;
            res.send('Acesso não permitido.');
        }
        else
        {       
            const id = parseInt(pId)
            let conn= await OracleDB.getConnection({
            user:process.env.USER,
            password: process.env.SENHA,
            connectString:process.env.ID
            });  
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