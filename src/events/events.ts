import {Request, Response, RequestHandler} from "express";
import OracleDB from "oracledb";


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
            const ID  = async (newEvent:events) =>{
                let conn= await OracleDB.getConnection({
                    user:process.env.USER,
                    password: process.env.SENHA,
                    connectString:process.env.ID
                });

                await conn.execute(
                    	`INSERT INTO events VALUES(dbms_random.string('x',16),:titulo,:desc ,:data, :horarioini, :horarioterm,:,:valor)`,
                        [newEvent.titulo,newEvent.desc,newEvent.data,newEvent.horaini, newEvent.horaterm, newEvent.valor]
                
                )
                const result = await conn.execute(
                    `Select token FROM accounts where 
                    nome=:nome and data = :data
                    and valor = :valor and 
                    horarioini = :horarioini
                    and horarioterm=:horarioterm`,
                    [newEvent.titulo, newEvent.data, newEvent.valor, newEvent.horaini, newEvent.horaterm]
                )
                await conn.close();
                let linhas = result.rows
                console.dir(linhas,{depth:null});
                return

            }
        }
        
    }






}