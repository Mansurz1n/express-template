import {Request, RequestHandler, Response} from "express";
import OracleDB from "oracledb"
import { AccountsHandler } from "../accounts/accounts";
import { EventsHandler } from "../events/events";



export namespace WalletHandler {

    export const addfunds: RequestHandler = async (req: Request, res: Response) => {
        const pEmail = req.get('email');
        const pAmount = req.get('amount');

        if (!pEmail || !pAmount) {
            res.status(400).send("Email ou valor para adicionar estão faltando.");
            return;
        }

        try {
            const connection = await OracleDB.getConnection();
            const result = await connection.execute(
                `UPDATE accounts SET carteira = carteira + :amount WHERE email = :email`,
                { pEmail, amount: parseFloat(pAmount) }
            );

            if (result.rowsAffected === 0) {
                res.status(404).send("Usuário não encontrado.");
            } else {
                res.status(200).send("Fundos adicionados com sucesso.");
            }

            await connection.close();
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
            const connection = await OracleDB.getConnection();

            const balanceCheck = await connection.execute(
                `SELECT carteira FROM accounts WHERE email = :email`,
                { pEmail }
            );
            if(balanceCheck.rows!==undefined){
                const userBalance = balanceCheck.rows[0] as number;
                if (!userBalance || userBalance < parseFloat(pValor)) {
                    res.status(403).send("Saldo insuficiente.");
                    await connection.close();
                    return;
                }
            }

            await connection.execute(
                `UPDATE accounts SET carteira = carteira - :valor WHERE email = :email`,
                { pEmail, valor: parseFloat(pValor) }
            );

            const newEvent = {
                titulo: pTitulo,
                desc: pDesc,
                data: pData,
                valor: pValor,
                horaini: pHoraini,
                horaterm: pHorarioT
            };

        
            res.status(200).send("Aposta realizada com sucesso.");
            
            await connection.close();
        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao realizar aposta.");
        }
    };

   
    export const withdrawFunds: RequestHandler = async (req: Request, res: Response) => {
        const pEmail = req.get('email');
        const pAmount = req.get('amount');
        const pAccount = req.get('account');

        if (!pEmail || !pAmount || !pAccount) {
            res.status(400).send("Parâmetros de saque incompletos.");
            return;
        }

        try {
            const connection = await OracleDB.getConnection();

            const balanceCheck = await connection.execute(
                `SELECT carteira FROM accounts WHERE email = :email`,
                { email: pEmail }
            );
            if(balanceCheck.rows!==undefined){
                const userBalance = balanceCheck.rows[0] as number;
                if (!userBalance || userBalance < parseFloat(pAmount)) {
                    res.status(403).send("Saldo insuficiente para saque.");
                    await connection.close();
                    return;
                }
            }

            await connection.execute(
                `UPDATE accounts SET carteira = carteira - :amount WHERE email = :email`,
                { pEmail, amount: parseFloat(pAmount) }
            );

           
            res.status(200).send("Saque realizado com sucesso.");
            
            await connection.close();
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
            const connection = await OracleDB.getConnection();

           
            

            res.status(200).send("Evento encerrado e fundos distribuídos.");
            
            await connection.close();
        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao encerrar o evento.");
        }
    };
}

 