import {Request, Response, RequestHandler} from "express";
import OracleDB from "oracledb";


export namespace EventsHandler {
    export type events = {
        nome:string;
        data:string;
        valor:string;
        horaini:string;
        horaterm:string;
    }

    export const CreateEvent:RequestHandler = (req:Request, res:Response) =>{
        const pNome = req.get('nameEvent');
        const pData = req.get('data');
        const pValor = req.get('valor');
        const pHoraini = req.get('HorarioI');
        const pHorarioT = req.get('HorarioT');
        if(pNome && pData && pValor && pHoraini && pHorarioT){
            const newEvent:events ={
                nome:pNome,
                data:pData,
                valor:pValor,
                horaini:pHoraini,
                horaterm:pHorarioT
            }
            const ID  = async (newEvent:events) =>{
                let conn= await OracleDB.getConnection({
                    user:process.env.USER,
                    password: process.env.SENHA,
                    connectionString:"BD-ACD"
                });

                await conn.execute(
                    	`INSERT INTO events VALUES(dbms_random.string('x',16),:nome, :data,:valor
                         , :horarioini, :horarioterm)`,
                         [newEvent.nome,newEvent.data, newEvent.valor, newEvent.horaini, newEvent.horaterm]
                
                )
                const result = await conn.execute(
                    `Select * FROM accounts where 
                    nome=:nome and data = :data
                    and valor = :valor and 
                    horarioini = :horarioini
                    and horarioterm=:horarioterm`,
                    [newEvent.nome,newEvent.data, newEvent.valor, newEvent.horaini, newEvent.horaterm]
                )
                await conn.close();
                let linhas = result.rows
                console.dir(linhas,{depth:null});
                return

            }
        }
        
    }






}