import {Request, Response, RequestHandler} from "express";
import OracleDB from "oracledb";
import { AccountsHandler } from "../accounts/accounts";
import { toDate } from "date-fns";



export namespace EventsHandler{
    export type Event = {
        titu:String,
        descr:String,
        data:Date,
        valor:Number,
        horarioIni:Date,
        horarioTerm:Date
    }

    export const CreateEvent: RequestHandler = async (req: Request, res: Response) => {  //Certo, falta algumas restrições
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


            const newEvent: Event = {
                titu: ptitulo,
                descr: pdesc,
                data: toDate(pData),
                valor: parseFloat(pValor),
                horarioIni: toDate(pData+pHoraini),
                horarioTerm: toDate(pData+pHorarioT)
            };
            let hj = new Date();
            if(newEvent.horarioTerm<hj || newEvent.horarioIni>newEvent.horarioTerm){
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
                    newEvent.titu,
                    newEvent.descr,
                    newEvent.data,
                    newEvent.horarioIni,
                    newEvent.horarioTerm,
                    newEvent.valor
                ]
            );

            await conn.commit();
            await conn.close();

            res.status(200).send("Novo evento adicionado com sucesso.");
        }




           
        } catch (error) {
            console.error("Erro ao criar evento:", error);
            res.status(500).send("Erro ao criar evento.");
        }
    };

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
                if(!pId){

                    console.dir("Selecione o id que irá aprovar");
                    res.redirect(300,'localhost:3000/events/nochek')
                
                }else{
                    if(!pRes && pRes==='sim' || pRes === 'nao'){
                        let conn= await OracleDB.getConnection({
                            user:process.env.USER,
                            password: process.env.SENHA,
                            connectString:process.env.ID
                            });   
                        
                        const id = parseInt(pId) 
                    await conn.execute
                    (
                        `Update events set aprova=:aprova where id=:id`,
                    [pRes,id]
                    );
    
    
                    const result1 = await conn.execute(
                    `Select * FROM events where 
                    id=:id`,
                    [id]
                    )
                    
                    await conn.commit();
                    console.dir(result1.rows,{depth:null})
                    res.status(200).send('Update feito com sucesso')
                    await conn.close();
                    

                    }else{
                        res.send('Resposta errada ou não encontrada. Por favor digitar sim ou nao')
                        res.statusCode = 400
                    }
                }
                
    
                
            }
        }else{
            res.send('Faltando Parametros')
        }
    
        }   

        export const DeleteEvent:RequestHandler = async (req:Request,res:Response) => 
        {
            const pEmail = req.get('email');
            const pPassword= req.get('password');
            const pId = req.get('id');

            if(pEmail && pPassword && pId){
                let conn= await OracleDB.getConnection({
                    user:process.env.USER,
                    password: process.env.SENHA,
                    connectString:process.env.ID
                    });   
                
                await conn.execute(
                    `DELETE FROM events WHERE id=:id`,
                    [parseInt(pId)]
                )
                await conn.commit();
                await conn.close();

                res.send('Delete feito com sucesso')
                
            }


        }

}