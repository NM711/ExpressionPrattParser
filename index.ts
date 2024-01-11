enum TokenIdentifiers {
  Int,
  Float,
  Addition,
  Subtraction,
  Multiplication,
  Division
};

type Token = {
  id: TokenIdentifiers;
  value: string
};


function isNumber(char: string): boolean {
  const num = Number(char);

  // When "0" is tested as a number, the output will be false. So in this case we check the char;
  // "." to search for floats.
  if (num || char === "0" || char === ".") {
    return true;
  } else {
    return false;
  };
};

class Lexer {
  private data: string[];
  private stateHolder: string;
  constructor (data: string) {
    this.data = data.split("");
    this.stateHolder = "";
  };

  private eat() {
    return this.data.shift();
  };

  public tokenize() {
 
    const tokens: Token[] = [];

    while (this.data.length > 0) {
      let char = this.eat();

      if (!char) break;

      if (char === "" || char === " ") {
        continue;
      };

      const operandLookup: { [index: string]: TokenIdentifiers } = {
         "+": TokenIdentifiers.Addition,
         "-": TokenIdentifiers.Subtraction,
         "/": TokenIdentifiers.Division,
         "*": TokenIdentifiers.Multiplication
      };

      while (isNumber(char)) {
        this.stateHolder += char;
        char = this.eat() as string;
      };

      if (isNumber(this.stateHolder)) {
    
            if (this.stateHolder.includes(".")) {
              tokens.push({ id: TokenIdentifiers.Float, value: this.stateHolder });
            } else tokens.push({ id: TokenIdentifiers.Int, value: this.stateHolder });

        this.stateHolder = "";
      }

      if (operandLookup[char]) {
        tokens.push({ id: operandLookup[char], value: char });
      };
    };
  
    return tokens;
  };
}


enum AbstarctSyntaxNodes {
  PROGRAM = "Program",
  BINARYEXPR = "BinaryExpression",
  UNARYEXPR = "UnaryExpression",
  NUMLITERAL = "NumberLiteral"
};

type NumLiteral = {
  id: AbstarctSyntaxNodes.NUMLITERAL;
  value: number;
};

type UnaryExpr = {
  id: AbstarctSyntaxNodes.UNARYEXPR,
  left: NumLiteral,
  right: NumLiteral,
  operator: string
};

type BinaryExprHand = UnaryExpr | NumLiteral;

type BinaryExpr = {
  id: AbstarctSyntaxNodes.BINARYEXPR;
  left: BinaryExprHand | Expr;
  right: BinaryExprHand | Expr;
  operator: string;
};

type Expr = BinaryExpr | UnaryExpr;

type AbstractNode = Expr | NumLiteral;

type ProgramNode = {
  id: AbstarctSyntaxNodes.PROGRAM;
  body: AbstractNode[];
};

enum PresedenceLevels {
  LOWEST,
  ADDITIVE, // ADDITION AND SUBTRACTION
  MULTIPLICATIVE, // MULTIPLICATION AND DIVISION
  PREFIX
};

class PrattParse {
  private tokens: Token[];
  // The Null Denotation (or nud) of a token is the procedure and arguments applying for that token when Left, an unclaimed parsed expression is not extant.
  // In simple terms, the nud of a token or in this case the value or lexeme of a token within a compiler/interpreter, is bound to be a null denotation if there is nothing
  // that comes after it, for example 3 + 10 Or !isTrue. In both the expressions there is only 2 spots where nothing comes before the token, at the start "3" and "!". These are
  // nuds, as the parser begins to divide expression during the creation of the syntax tree, then the value gets returned.

  // this denotation type can be ontained via the .look() method,
  // because this.look() will never have a left context due to how its always the first item within the token array.

  // The Left Denotation (or led) of a token is the procedure, arguments, and lbp applying for that token when there is a Left, an unclaimed parsed expression.
  // In other words, the left denotation is a way to handle a token within a parser when the token is the operand.
 
  constructor (tokens: Token[]) {
    this.tokens = tokens;
  };

  private eat() {
    return this.tokens.shift() as Token;
  };

  private look() {
    return this.tokens[0] as Token;
  };

  private getPresedence(): PresedenceLevels {
    switch (this.look().id) {
      case TokenIdentifiers.Addition:
      case TokenIdentifiers.Subtraction:
        return PresedenceLevels.ADDITIVE;
      case TokenIdentifiers.Multiplication:
      case TokenIdentifiers.Division:
        return PresedenceLevels.MULTIPLICATIVE;
      default: {
        return PresedenceLevels.LOWEST;
      };
    };
  };

  private parsePrimary(): NumLiteral {
    switch (this.look().id) {
      case TokenIdentifiers.Int:
      case TokenIdentifiers.Float:
        return {
          id: AbstarctSyntaxNodes.NUMLITERAL,
          value: parseInt(this.eat().value) || parseFloat(this.eat().value)
        };
      default: {
        console.log(this.look());
        throw new Error("Cannot parse unknown");
      };
    };
  };

  private parseExpr(lhs: Expr | NumLiteral, minimumPresedence: PresedenceLevels = 0): (Expr | NumLiteral) {
    
    const operatorPresedence = this.getPresedence();

    while (this.look() && operatorPresedence >= minimumPresedence) {
      // we know its for sure and operator since the presedence is greater than 0
      const operator = this.eat();
      let rhs: NumLiteral | Expr = this.parsePrimary();


      // parse primary advances the token

      while (this.look() && this.getPresedence() > operatorPresedence) {
        rhs = this.parseExpr(rhs, this.getPresedence()) as Expr
      };
      
      console.log(lhs, operator, rhs)
    
      lhs = {
        id: AbstarctSyntaxNodes.BINARYEXPR,
        left: lhs,
        right: rhs,
        operator: operator.value,
      };
    };

    return lhs;
  };

  public parse() {
    const program: ProgramNode = {
      id: AbstarctSyntaxNodes.PROGRAM,
      body: []
    };

    program.body.push(this.parseExpr(this.parsePrimary(), 0));

    return program;
  };
};

function main () {
  const lexer = new Lexer("20 + 30 - 49 * 25 + 10");
  const tokens = lexer.tokenize();
  const parser = new PrattParse(tokens);

  const program = parser.parse();
  
  console.log(program);

  console.log(JSON.stringify(program, null, 2));
};

main();
