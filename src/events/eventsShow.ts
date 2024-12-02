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
                    `SELECT * FROM EVENTS where TO_DATE(FIM, 'YYYY-MM-DD"T"HH24:MI') <= TRUNC(SYSDATE, 'MI') and aprova='sim' ORDER BY ID ASC`,   
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
           aprova='pen' ORDER BY ID ASC`,   
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
                    `SELECT * FROM EVENTS where TO_DATE(FIM, 'YYYY-MM-DD"T"HH24:MI') >= TRUNC(SYSDATE, 'MI') and aprova='sim' ORDER BY ID ASC`,   
                )
                await conn.close();
                res.json(result.rows)
            
        }

        export const  SearchEvent:RequestHandler = async (req:Request, res:Response)=>{
            
            let pNome = req.get('nome');
            
            if(pNome){
                pNome = '%'+pNome+'%'
                let conn= await OracleDB.getConnection({
                    user:process.env.USER,
                    password: process.env.SENHA,
                    connectString:process.env.ID
                });   
                const result = await conn.execute(
                    `SELECT * FROM EVENTS where titulo like :titulo ORDER BY ID ASC`,
                    [pNome]   
                )
                await conn.close();
                res.json(result.rows)
            }else{
                res.send('Por favor digite um titulo.')
            }
            
        }
}










    




