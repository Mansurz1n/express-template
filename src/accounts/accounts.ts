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

    

    async function login(email:string, password:string){
        //passo a passo 
        //conectar no oracle 
        let conn=await OracleDB.getConnection({
            user: process.env.USER,
            password: process.env.SENHA,
            connectString:process.env.ID
        });
        //fazer o select para verificar se a conta exixste.
        const result = await conn.execute(
            `SELECT funcao
             FROM accounts
             WHERE email = :email and password = :password`,
            [email,password]
            // bind value for :id
        );


        const linhas = result.rows;
        console.dir(linhas,{depth:null});
        


        await conn.close();
        //se a conta existe, preencher o objeto conta.
        //se não existe, devolver undefined.
        if (linhas?.length===0){
        return undefined
        }
        else {
            return linhas
        }
    }
    export const loginHandler:RequestHandler = (req:Request, res:Response) => {
        const pEmail =req.get('email');
        const pPassword = req.get('password');
        if(pEmail && pPassword){
            let a=req.get('funcao')  
            let b = login(pEmail,pPassword)
            res.send('Login Efetuado com sucesso')
            
            
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
            connectString:process.env.ID
        });
    

        await conn.execute(
            //precisa colocar o outro bagulho do id 
            // que é se faz no BD mas eu n lembro mb
            `INSERT INTO accounts VALUES  (SEQ_accounts.NEXTVAL,:name, :email, :password, :birthdate)`,
            [ua.name, ua.email, ua.password, ua.birthdate]
        )
        const result = await conn.execute(
            `Select ID FROM accounts where 
            name=:name and email = :email 
            and password = :password and 
            birthdate = :birthdate`,
            [ua.name, ua.email, ua.password, ua.birthdate]
        )
        await conn.close();


        let linhas = result.rows;
        if (linhas!==undefined){
            let a=linhas[1] ;
            console.dir(linhas,{depth:null})
            return a 

        }
            
        console.dir(linhas,{depth:null});
        
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
            res.send(`Nova conta adicionada. Código: ${ID}`);
        }else{
            res.statusCode = 400;
            res.send("Parâmetros inválidos");
        }
    }

}
