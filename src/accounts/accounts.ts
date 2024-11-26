import {Request, RequestHandler, Response} from "express";
import OracleDB from "oracledb"


require('dotenv').config()
/*
    Nampespace que contém tudo sobre "contas de usuários"
*/

export namespace AccountsHandler {
    
    /**
     * Tipo UserAccount
     */
    export type UserAccount = {
        name:string;
        email:string;
        password:string;
        birthdate:string; 
    };
 
    //estudar .env(Dotenv)

    

    export async function login(email:string, password:string){
        //passo a passo 
        //conectar no oracle 
        let conn=await OracleDB.getConnection({
            user: process.env.USER,
            password: process.env.SENHA,
            connectString:process.env.ID
        });
        //fazer o select para verificar se a conta exixste.
        const result = await conn.execute(
            `Select funcao FROM accounts where email = :email and password = :password`,
            [ email, password]
        )
        let linhas = result.rows;
        console.dir(linhas,{depth:null});
        await conn.commit();
        
        await conn.execute(
        `begin
            dbms_output.ENABLE(NULL);
        end;`
        )
        const token = await conn.execute(
            `begin
                dbms_output.put_line(dbms_random.string('x',16));
            end;`
        )


        await conn.close();
        if (result===undefined)return undefined



        
        



        if(result.rows && result.rows.length>0){
        const row:string = result.rows[0] as string;
        
        const a:string = row[0] as string
        //se a conta existe, preencher o objeto conta.
        //se não existe, devolver undefined.
        return a
        }
    }
    export const loginHandler:RequestHandler = async (req:Request, res:Response) => {
        const pEmail =req.get('email');
        const pPassword = req.get('password');
        if(pEmail && pPassword){
            let b = login(pEmail,pPassword)
            if (await b==='n') res.send(`Login Efetuado com sucesso`)
            else if (await b==='adm')res.send('Bem vindo adm')        
            else res.send('Conta não encontrada')
        }else{
            res.send('Faltando parametros')
        }
    }
/*
    /**
     * Salva uma conta no banco de dados. 
     * @param ua conta de usuário do tipo @type {UserAccount}
     * @returns @type { number } o código da conta cadastrada como posição no array.
     */
    /*export function saveNewAccount(ua: UserAccount) : number{
        accountsDatabase.push(ua);
        return accountsDatabase.length;


    }*/

    async function saveNewAccount(ua:UserAccount) {
        let conn=await OracleDB.getConnection({
            user: process.env.USER,
            password: process.env.SENHA,
            connectString: process.env.ID
            
        

        });
    

        await conn.execute(
            //precisa colocar o outro bagulho do id 
            // que é se faz no BD mas eu n lembro mb
            `insert into accounts VALUES(SEQ_accounts.NEXTVAL,:name, :email, :password, :birthdate, 0, 'n')`,
            [ua.name, ua.email, ua.password, ua.birthdate]
        )
        const result = await conn.execute(
            `Select Id FROM accounts where nome=:name and email = :email and password = :password`,
            [ua.name, ua.email, ua.password]
        )
        await conn.commit();







        await conn.close();

        if(result.rows && result.rows.length>0){
            const row:string = result.rows[0] as string;
            console.dir(row);
            const a:string = row[0] as string
            console.dir(a)
            
        console.dir(a,{depth:null});
        
        return a
        }
        return
    }

    /**
     * Função para tratar a rota HTTP /signUp. 
     * @param req Requisição http tratada pela classe @type { Request } do express
     * @param res Resposta http a ser enviada para o cliente @type { Response }
     */
    export const createAccountRoute: RequestHandler = (req: Request, res: Response) => {
        // Passo 1 - Receber os parametros para criar a conta
        const pName = req.get('name');
        const pEmail = req.get('email');
        const pPassword = req.get('password');
        const pBirthdate = req.get('birthdate');
        
        if(pName && pEmail && pPassword && pBirthdate){
            // prosseguir com o cadastro... 
            const newAccount: UserAccount = {
                name: pName,
                email: pEmail, 
                password: pPassword,
                birthdate: pBirthdate,
            }
            const ID = saveNewAccount(newAccount);
            
            res.statusCode = 200; 
            res.send(`Nova conta adicionada.`);
        }else{
            res.statusCode = 400;
            res.send("Parâmetros inválidos");
        }
    }

}

