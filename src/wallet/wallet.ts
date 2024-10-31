import {Request, RequestHandler, Response} from "express";
import OracleDB from "oracledb"
import { AccountsHandler } from "../accounts/accounts";
import { EventsHandler } from "../events/events";



export namespace WalletHandler {

    export const addfunds: RequestHandler = async (req: Request, res: Response) => {
        const pEmail = req.get('email');
        const pValor = req.get('valor');

        if (!pEmail || !pValor) {
            res.status(400).send("Email ou valor para adicionar estão faltando.");
            return;
        }

        try {
            const conn = await OracleDB.getConnection({
                user:process.env.USER,
                password: process.env.SENHA,
                connectString:process.env.ID
            });
            const result = await conn.execute(
                `UPDATE accounts SET carteira = carteira + :Valor WHERE email = :email`,
                { pEmail, Valor: parseFloat(pValor) }
            );

            if (result.rowsAffected === 0) {
                res.status(404).send("Usuário não encontrado.");
            } else {
                res.status(200).send("Fundos adicionados com sucesso.");
            }

            await conn.close();
        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao adicionar fundos.");
        }
    };


    export const betOnEvent: RequestHandler = async (req: Request, res: Response) => {
        const pEmail = req.get('email');
        const pTitulo = req.get('nameEvent');
        const pDesc = req.get('descri');
        const pData = req.get('data');
        const pValor = req.get('valor');
        const pHoraini = req.get('HorarioI');
        const pHorarioT = req.get('HorarioT');

        if (!pEmail || !pTitulo || !pDesc || !pData || !pValor || !pHoraini || !pHorarioT) {
            res.status(400).send("Parâmetros incompletos.");
            return;
        }

        try {
            const conn = await OracleDB.getConnection({
                user:process.env.USER,
                password: process.env.SENHA,
                connectString:process.env.ID
            });

            const balanceCheck = await conn.execute(
                `SELECT carteira FROM accounts WHERE email = :email`,
                { pEmail }
            );
            if(balanceCheck.rows!==undefined){
                const userBalance = balanceCheck.rows[0] as number;
                if (!userBalance || userBalance < parseFloat(pValor)) {
                    res.status(403).send("Saldo insuficiente.");
                    await conn.close();
                    return;
                }
            }

            await conn.execute(
                `UPDATE accounts SET carteira = carteira - :valor WHERE email = :email`,
                { pEmail, valor: parseFloat(pValor) }
            );

            const newEvent:EventsHandler.events = {
                titulo: pTitulo,
                desc: pDesc,
                data: pData,
                valor: pValor,
                horaini: pHoraini,
                horaterm: pHorarioT
            };

        
            res.status(200).send("Aposta realizada com sucesso.");
            
            await conn.close();
        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao realizar aposta.");
        }
    };

   
    export const withdrawFunds: RequestHandler = async (req: Request, res: Response) => {
        const pEmail = req.get('email');
        const pValor = req.get('Valor');
        const pAccount = req.get('account');

        if (!pEmail || !pValor || !pAccount) {
            res.status(400).send("Parâmetros de saque incompletos.");
            return;
        }

        try {
            const conn = await OracleDB.getConnection({
                user:process.env.USER,
                password: process.env.SENHA,
                connectString:process.env.ID
            });

            const balanceCheck = await conn.execute(
                `SELECT carteira FROM accounts WHERE email = :email`,
                { pEmail }
            );
            if(balanceCheck.rows!==undefined){
                const userBalance = balanceCheck.rows[0] as number;
                if (!userBalance || userBalance < parseFloat(pValor)) {
                    res.status(403).send("Saldo insuficiente para saque.");
                    await conn.close();
                    return;
                }
            }

            await conn.execute(
                `UPDATE accounts SET carteira = carteira - :valor WHERE email = :email`,
                { pEmail, valor: parseFloat(pValor) }
            );

           
            res.status(200).send("Saque realizado com sucesso.");
            
            await conn.close();
        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao realizar saque.");
        }
    };


    export const finishEvent: RequestHandler = async (req: Request, res: Response) => {
        const pEventId = req.get('eventId');
        const pVerdict = req.get('verdict');

        if (!pEventId || !pVerdict) {
            res.status(400).send("Parâmetros para encerrar o evento estão incompletos.");
            return;
        }

        try {
            const  conn = await OracleDB.getConnection({
                user:process.env.USER,
                password: process.env.SENHA,
                connectString:process.env.ID
            });

           
            

            res.status(200).send("Evento encerrado e fundos distribuídos.");
            
            await conn.close();
        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao encerrar o evento.");
        }
    };
}

 