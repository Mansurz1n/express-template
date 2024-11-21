import {Request, Response, RequestHandler} from "express";
import OracleDB from "oracledb";
import { AccountsHandler } from "../accounts/accounts";
import { toDate } from "date-fns";



export namespace EventsHandler{
    export type Event = {
        titu:String,
        descr:String,
        data:string,
        valor:string,
        horarioIni:string,
        horarioTerm:string
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
                data: pData,
                valor: pValor,
                horarioIni: `${pData} ${pHoraini} `,
                horarioTerm: `${pData} ${pHorarioT} `
            };
            let hj = new Date();
            if(toDate(newEvent.horarioTerm)>hj || toDate(newEvent.horarioIni)>toDate(newEvent.horarioTerm)){
                const conn = await OracleDB.getConnection({
                user: process.env.USER,
                password: process.env.SENHA,
                connectString: process.env.ID
            });

            await conn.execute(

                `INSERT INTO events (ID, TITULO, DESCR, DATA_APOSTA, INICIO, FIM, VALORAPOSTA, APROVA)
                VALUES (SEQ_events.NEXTVAL, :titulo, :descr, :data_aposta, :inicio, :fim, :valoraposta, 'pen')`,
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
        else{
            res.status(400).send("Data já expirada")
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
        const pId =req.get('ide');
        const pRes = req.get('res');
        if(pEmail && pPassword && pRes){
    
    
            const linhas= await AccountsHandler.login(pEmail, pPassword)
    
            if(linhas===null || linhas === undefined){
                res.statusCode = 403;
                res.send('Acesso não permitido.');
            }

            else
            {
                if(!pId){

                    console.dir("Selecione o id que irá aprovar");
                    res.redirect(300,'localhost:3000/events/nochek')
                
                }else{
                    console.dir(pRes)
                    if( pRes==='sim' || pRes === 'nao'){
                        let conn= await OracleDB.getConnection({
                            user:process.env.USER,
                            password: process.env.SENHA,
                            connectString:process.env.ID
                            });   
                        
                        const id = parseInt(pId) 
                    
    
                    //Verificando se o id está na lista
                    let result1 = await conn.execute(
                    `Select id FROM events`,
                    )




                    if(result1.rows){
                    var TemID = false //Posição do id na lista 
                    for (var nID in result1.rows){
                        let  row:string  =result1.rows[nID] as string  
                        if(parseInt(row[0])===id){
                            TemID = true
                            break
                        }
                    } 



                    if(TemID === false){
                        await conn.close();
                        res.status(400).send("Não há um evento com esse id")
                        return
                    }


                    await conn.execute
                    (
                        `Update events set aprova=:aprova where id=:id`,
                    [pRes,id]
                    );

                    await conn.commit();
                    
                    result1 = await conn.execute(
                        `Select * FROM events where 
                        id=:id`,
                        [id]
                    )
                    
                    
                    console.dir(result1.rows,{depth:null})
                    res.status(200).send('Update feito com sucesso')
                    await conn.close();
                    }else{
                        await conn.close();
                        res.status(500).send("Erro de conexão com o Banco de dados")
                        return
                    }

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
            try{
                const pEmail = req.get('email');
                const pPassword= req.get('password');
                const pId = req.get('id');
                
                if(pEmail && pPassword && pId){
                    const linhas= await AccountsHandler.login(pEmail, pPassword)
                    if(linhas!==null || linhas !== undefined){
                        
                        let conn= await OracleDB.getConnection({
                            user:process.env.USER,
                            password: process.env.SENHA,
                            connectString:process.env.ID
                            });   
                            const id = parseInt(pId)


                            //Verificando se O id está na lista
                            let result1 = await conn.execute(
                                `Select id FROM events`,
                                )
                                if(result1.rows){
                                var TemID = false //Posição do id na lista 
                                for (var nID in result1.rows){
                                    let  row:string  =result1.rows[nID] as string  
                                    if(parseInt(row[0])===id){
                                        TemID = true
                                        break
                                    }

                                } 
            
                                if(TemID === false){
                                    await conn.close();
                                    res.status(400).send("Não há um evento com esse id")
                                    return
                                }
            
                            }else{
                                await conn.close();
                                res.status(500).send("Erro de conexão com o Banco de dados")
                                return
                            }
                        await conn.execute(
                            `DELETE FROM events WHERE id=:id`,
                            [id]
                        )
                        await conn.commit();
                        await conn.close();
    
                        res.statusCode=200

                        res.send('Delete feito com sucesso')

                        
                    }else{
                        res.statusCode = 403;
                        res.send('Acesso não permitido.');
                    }
                    
                }
                else{
                    res.status(500).send("Parametros faltantes")
                }
            }catch(error){
                console.error("Erro ao criar evento:", error);
                res.status(500).send("Erro ao criar evento.");
            }
            
        }

}