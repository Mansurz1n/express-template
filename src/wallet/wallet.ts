import {Request, RequestHandler, Response} from "express";
import OracleDB from "oracledb"
import { AccountsHandler } from "../accounts/accounts";
import { EventsHandler } from "../events/events";



export namespace WalletHandler 
{
    export const addfunds: RequestHandler = async (req: Request, res: Response) =>
    {
        const pEmail = req.get('email');
        const pAmount = req.get('amount');

        if (!pEmail || !pAmount) {
            res.status(400).send("Email ou valor para adicionar estão faltando.");
            return;
        }

        try {
            const connection = await OracleDB.getConnection();
            const result = await connection.execute(
                `UPDATE Users SET balance = balance + :amount WHERE email = :email`,
                { email: pEmail, amount: parseFloat(pAmount) }
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
    }

    export const betOnEvent: RequestHandler = async (req: Request, res: Response) => {
        const pEmail = req.get('email');
        const ptitulo = req.get('nameEvent');
        const pdesc = req.get('descri');
        const pData = req.get('data');
        const pValor = req.get('valor');
        const pHoraini = req.get('HorarioI');
        const pHorarioT = req.get('HorarioT');

        if (!pEmail || !ptitulo || !pdesc || !pData || !pValor || !pHoraini || !pHorarioT) {
            res.status(400).send("Parâmetros incompletos.");
            return;
        }

        try {
            const connection = await OracleDB.getConnection();

            const balanceCheck = await connection.execute(
                `SELECT balance FROM Users WHERE email = :email`,
                { email: pEmail }
            );

            const userBalance = balanceCheck.rows[0]?.BALANCE;
            if (!userBalance || userBalance < parseFloat(pValor)) {
                res.status(403).send("Saldo insuficiente.");
                await connection.close();
                return;
            }

            await connection.execute(
                `UPDATE Users SET balance = balance - :valor WHERE email = :email`,
                { email: pEmail, valor: parseFloat(pValor) }
            );

            const newEvent: EventsHandler.events = {
                titulo: ptitulo,
                desc: pdesc,
                data: pData,
                valor: pValor,
                horaini: pHoraini,
                horaterm: pHorarioT
            };

            // Aqui pode-se adicionar a lógica para salvar o evento na base de dados
            res.status(200).send("Aposta realizada com sucesso.");
            
            await connection.close();
        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao realizar aposta.");
        }
    }
}
 