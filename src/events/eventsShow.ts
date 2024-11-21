import {Request, Response, RequestHandler} from "express";
import OracleDB from "oracledb";




export namespace EventsShow {
        
        export const ocoridos:RequestHandler = async (req: Request, res: Response)=>
        {
    
                let conn= await OracleDB.getConnection({
                    user:process.env.USER,
                    password: process.env.SENHA,
                    connectString:process.env.ID
                });   
                let hj = new Date();
                const result = await conn.execute(
                    `select * from events where CONVERT(DATE,DATA_APOSTA)<=CONVERT(DATE,:hj) and CONVERT(TIMESTAMP,FIM)<CONVERT(TIMESTAMP,:hj);`,
                    [hj,hj]   
                )
                await conn.close();
                
                res.json(result.rows)
            
            
        }


   
        export const nochek:RequestHandler = async (req: Request, res: Response)=> // unico funcionando por enquanto
        {
            
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

            res.json(linhas)
            
        
            
            
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










    




