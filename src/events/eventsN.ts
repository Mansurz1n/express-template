import {Request, Response, RequestHandler, NextFunction} from "express";
import OracleDB from "oracledb";
import { AccountsHandler } from "../accounts/accounts";
import { toDate } from "date-fns";
import jwt, { JwtPayload } from "jsonwebtoken";



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
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                res.status(401).json({ error: 'Token não fornecido.' });
                return;
            }
                // Decodificar o token JWT para obter o email do usuário
                const decoded = jwt.verify(token, `${process.env.CHAVE}`) as JwtPayload;
                const email = decoded.email;

            if (!ptitulo || !pdesc || !pData || !pValor || !pHoraini || !pHorarioT) {
                res.status(400).send("Parâmetros inválidos");
                return;
            }


            const newEvent: Event = {
                titu: ptitulo,
                descr: pdesc,
                data: pData,//Até que dia pode apostar
                valor: pValor,
                horarioIni: pHoraini,//Quando vai acontecer         Exemplo 2025-01-05 10:00 
                horarioTerm:  pHorarioT//Quando vai terminar        Exemplo 2025-01-05 12:00
            };
            let hj = new Date();
            if(toDate(newEvent.horarioTerm)>hj || toDate(newEvent.horarioIni)>toDate(newEvent.horarioTerm)){
                const conn = await OracleDB.getConnection({
                user: process.env.USER,
                password: process.env.SENHA,
                connectString: process.env.ID
            });

            await conn.execute(

                `INSERT INTO events (ID, TITULO, DESCR, DATA_APOSTA, INICIO, FIM, VALORAPOSTA, APROVA, CRIADOR)
                VALUES (SEQ_events.NEXTVAL, :titulo, :descr, :data_aposta, :inicio, :fim, :valoraposta, 'pen', :criador)`,
                [
                    newEvent.titu,
                    newEvent.descr,
                    newEvent.data,
                    newEvent.horarioIni,
                    newEvent.horarioTerm,
                    newEvent.valor,
                    email
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

    export const AvaliarEvento:RequestHandler = async (req:Request, res:Response,next:NextFunction) => 
        {
        const token = req.get('authorization');
        const pId =req.get('ide');
        const pRes = req.get('res');
        if(pRes){
    
    
            await AccountsHandler.verificar(req,res,next,token)
            const user = (req as any).user
           if(!user || !user.funcao){
                res.statusCode = 403;
                res.send('Falha no login.');
                return
           }
           else{
            const funcao =user.funcao
            if(funcao==='n' || funcao === undefined){
                res.statusCode = 403;
                res.send('Acesso não permitido.');
                return
            }

            else
            {
                
                if(!pId){

                    console.dir("Selecione o id que irá aprovar");
                
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
                    return
                    }else{
                        await conn.close();
                        res.status(500).send("Erro de conexão com o Banco de dados")
                        return
                    }

                    }else{
                        res.send('Resposta errada ou não encontrada. Por favor digitar sim ou nao')
                        res.statusCode = 400
                        return
                    }
                }
                
                }
                
            }
        }else{
            res.send('Faltando Parametros')
            return
        }
    
        }   

        export const DeleteEvent:RequestHandler = async (req:Request,res:Response,next:NextFunction) => 
        {
            try{
                const pId = req.get('id');
                const token = req.headers['authorization'];
                if(pId){
                    AccountsHandler.verificar(req,res,next,token)
                    const user = (req as any).user
                    if(!user || !user.funcao){
                        res.statusCode = 403;
                        res.send('Login não efetuado.');
                    }
                    else{
                    const funcao =user.funcao
                    if(funcao!=='n' || funcao !== undefined){
                        
                        let conn= await OracleDB.getConnection({
                            user:process.env.USER,
                            password: process.env.SENHA,
                            connectString:process.env.ID
                            });   
                            const id = parseInt(pId)


                            //Verificando se O id está no evento
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
                            `Update events set aprova='excluido' where id=:id`,
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