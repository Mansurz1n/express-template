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
            try{
                
                
                const result = await conn.execute(
                    `SELECT * FROM EVENTS where TO_DATE(FIM, 'YYYY-MM-DD HH24:MI') <= TRUNC(SYSDATE, 'MI') and aprova='sim'`,   
                )
                
                await conn.close();
                
                res.json(result.rows)

            }catch(error){
                await conn.close();
                console.error(error);
                res.status(500).send("Erro ao mostrar os eventos ocorridos.");
            }
                
            
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
                    `SELECT * FROM EVENTS where TO_DATE(FIM, 'YYYY-MM-DD HH24:MI') >= TRUNC(SYSDATE, 'MI') and aprova='sim'`,   
                )
                await conn.close();
                res.json(result.rows)
            
    }
}










    




