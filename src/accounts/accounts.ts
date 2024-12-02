import {Request, RequestHandler, response, Response} from "express";
import OracleDB from "oracledb"
import jwt, { JwtPayload } from "jsonwebtoken"; 
import { NextFunction } from "express-serve-static-core";

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
        carteira: number;
        funcao :string;
    };
 
    //estudar .env(Dotenv)






    export function verificar(req:Request ,res:Response ,next:NextFunction,token: string | undefined ){
        console.dir(token)
        if(!token)return res.status(401).json({auth:false, mesage:'Login não efetuado.'})
        try{
            const decoded =jwt.verify(token,`${process.env.CHAVE}`)
            console.dir(decoded)
            req.user = decoded 
            return
        }catch{
            return res.status(403).json({ message: 'Token inválido ou expirado' });
        };

    }

    export async function login(email:string, password:string,res:Response){
        //passo a passo 
        //conectar no oracle 
        let conn=await OracleDB.getConnection({
            user: process.env.USER,
            password: process.env.SENHA,
            connectString:process.env.ID
        });

        //Verificando se o email existe
        let result1 = await conn.execute(
            `Select email FROM accounts`,
            )
            if(result1.rows){
            var TemEmail = false //Posição do id na lista 
            for (var nID in result1.rows){
                let  row:string  =result1.rows[nID] as string  
                if(row[0]===email){
                    TemEmail = true
                    break
                }

            } 

            if(TemEmail === false){
                await conn.close();
                res.status(400).send("Não há uma conta com esse email.")
                return
            }
        }


        const result = await conn.execute(
            `Select funcao,carteira FROM accounts where email = :email and password = :password`,
            [ email, password]
        )
        
        if(result.rows && result.rows.length>0){
        const row:string = result.rows[0] as string;
        const carteira:string = row[1] as string
        const funcao:string = row[0] as string
        //se a conta existe, preencher o objeto conta.
        //se não existe, devolver undefined.
        const accessToken = jwt.sign({email, funcao, carteira}, `${process.env.CHAVE}`,{
            expiresIn:"2h"
        });

        

       

        res.setHeader('authorization',`${accessToken}`)
        console.dir(accessToken)
        return accessToken
        }
        return
    }

    export const loginHandler:RequestHandler = async (req:Request, res:Response,next:NextFunction) => {
        const pEmail =req.get('email');
        const pPassword = req.get('password');
        
        if(pEmail && pPassword){
            let token = await login(pEmail,pPassword,res) 
            if(token){
            const decoded =jwt.verify(token,`${process.env.CHAVE}`)
            console.dir(decoded)
            req.user = decoded 
            const user = (req as any).user
            if(user && user.funcao){
                const funcao =user.funcao
                console.dir(funcao)
            if (await funcao==='n') res.json({auth: true, token:token ,mesage:`Login Efetuado com sucesso`})
            else if (await funcao==='adm')res.json({auth:true, token:token, mesage:'Bem vindo adm'})        
            else res.json({auth:false, token:null, mesage:'Conta não encontrada'})
            }
            }
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
            
            const a:string = row[0] as string
            
        
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
                carteira: 0 ,
                funcao:'n'
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

