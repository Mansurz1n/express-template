import {Request, Response, RequestHandler} from "express";
import OracleDB from "oracledb";
import { EventsHandler } from "../events/events";

export namespace WalletHandler{
    export const AddFunds:RequestHandler = (req:Request,res:Response)=>
    {

    }
    export const withdrawFunds:RequestHandler = (req:Request,res:Response)=>
    {
            
    }
    export const betOnEvent:RequestHandler = (req:Request,res:Response)=>
    {
        const pEmail = req.get('email');
        const ptitulo = req.get('nameEvent');
        const pdesc = req.get('descri')
        const pData = req.get('data');
        const pValor = req.get('valor');
        const pHoraini = req.get('HorarioI');
        const pHorarioT = req.get('HorarioT');
        if(ptitulo && pdesc && pData && pValor && pHoraini && pHorarioT){
            const newEvent:EventsHandler.events ={
                titulo:ptitulo,
                desc:pdesc,
                data:pData,
                valor:pValor,
                horaini:pHoraini,
                horaterm:pHorarioT
            }
        }
        if(pEmail){
            res.statusCode = 403;
            res.send('Ta faltando coisa')
        }
        else{
            
        }
    }






}