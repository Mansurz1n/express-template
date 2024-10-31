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
    

    export const CreateEvent:RequestHandler = async (req:Request, res:Response) =>{
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
                let conn= await OracleDB.getConnection({
                    user:process.env.USER,
                    password: process.env.SENHA,
                    connectString:process.env.ID
                });
                
                await conn.execute(
                    	`INSERT INTO events VALUES(SEQ_accounts.NEXTVAL,dbms_random.string('x',16),:titulo,:desc ,:data, :horarioini, :horarioterm,:valor,null)`,
                        [newEvent.titulo,newEvent.desc,newEvent.data,newEvent.horaini,newEvent.horaterm, valor]
                
                )
                const result = await conn.execute(
                    `Select * FROM events where 
                    nome=:nome and data = :data
                    and valor = :valor and 
                    horarioini = :horarioini
                    and horarioterm=:horarioterm`,
                    [newEvent.titulo, newEvent.data, valor, newEvent.horaini, newEvent.horaterm]
                )
                await conn.commit();
                await conn.close();
                let linhas = result.rows
                if(!linhas || linhas.length===0){
                    res.send('deu ruim')
                    res.statusCode = 400
                }else{
                console.dir(linhas,{depth:null});
                res.statusCode = 200
                res.send(`Novo evento adicionado. Codigo: ${linhas[0]}`)
                }

            
        }else{
            res.statusCode = 400
            res.send("Parametros invalidos")
        }
        
    }
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
                let linhas = result.rows;
                res.send(linhas)
            
            
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
                let linhas = result.rows;
                res.send(linhas)
            
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
                let linhas = result.rows;
                res.send(linhas)
            
        }
    }

    export const AvaliarEvento:RequestHandler = async (req:Request, res:Response) => 
    {
    const pEmail =req.get('email');
    const pPassword = req.get('password');
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
            const result = await conn.execute(
                `Select Id, titulo, descr, data_aposta, inicio, fim, valoraposta  FROM events where 
                aprova=NULL`,   
            )
            let linhas = result.outBinds;
            res.send(linhas)


            console.log("Selecione o id que irá aprovar");
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
                await conn.commit();
                res.send(result2.outBinds)
                await conn.close();
                
                res.statusCode = 200
                }else{
                    await conn.close();
                    res.statusCode= 403

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
    
    
                const pRes =req.get('res');
                if(pRes){
                    const id = parseInt(pRes) 
    
                    await conn.execute
                    (`Delete from events where id=:id`
                    [id]
                    );
                    await conn.commit();
                    await conn.close();
                    res.send("Delete feito com sucesso")
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