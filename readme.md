### Note

I know that the implementation may not be the greatest and it may even be an oversimplification but, it is my first time implementing this kind of parser.

### Pratt Parser

The general takeway behind the idea of a Pratt Parser is that, unlike a recursive decent parser,
you rely more on the current presedence level of a token to know what the next method call will be, than on recursion itself for handling presedence.

In a recursive decent parser, if you wanted to handle additives - ("+" | "-") and multiplicatives ("*" | "/"),
you would need to recursively call a higher presedence function or method within the lower presedence method, that itself is actually within
a loop, in order to handle higher presedence levels.

Here is a small example of this in a parser I built using recursive decent:

```ts

  private parseMultiplicative (): AbstractSyntaxTreeTypes.Expr | AbstractSyntaxTreeTypes.Literal {
    let left: AbstractSyntaxTreeTypes.Literal | AbstractSyntaxTreeTypes.Expr = this.parsePrimary();

    while (this.look() && this.isMultiplicative()) {
      const operator = this.eat();
      const right = this.parsePrimary();

      left = {
        type: AbstractSyntaxTreeTypes.NodeType.EXPR_BINARY,
        left: left as AbstractSyntaxTreeTypes.Literal,
        right,
        operator: operator.lexeme as AbstractSyntaxTreeTypes.ExpressionOperator
      };
    };

    return left;
  };

  private parseAdditive () {
    let left = this.parseMultiplicative();

    while (this.look() && this.isAdditive()) {
      const operator = this.eat();
      const right = this.parseMultiplicative();

      left = {
        type: AbstractSyntaxTreeTypes.NodeType.EXPR_BINARY,
        left: left as AbstractSyntaxTreeTypes.Literal,
        right,
        operator: operator.lexeme as AbstractSyntaxTreeTypes.ExpressionOperator
      } as AbstractSyntaxTreeTypes.BinaryExpr;
    };

    return left;
  };

  private parseExpr() {
    return this.parseAdditive();
  };

   while (this.look().id !== LexerGrammarTypes.LangTokenIdentifier.EOF) {
        root.body.push(this.parse());
  };

```

Obviously, I cannot share the full implementation because it would be too long. But with this, you should be able to get an idea of how its different. You essentially make a new method depedning on the presedence level you are dealing with,
and recall somewhere in your code, where you need to check for the current presedence.

On the other hand we have the Pratt Parser, instead of handling presedence by indiscrimately calling a method, you check the current presedence of the token through a map, conditional, switch, etc. And with the presedence you receive,
within a loop you decide wether or not you should recall the same method. Note I never said, Pratt Parsing does not use iteration + recursion or just recursion, all I said is that it relies less on recursion than your typical recursive decent.

Anyways, as a learn I will update this readme over time. Probably...

### Resources

* https://en.wikipedia.org/wiki/Operator-precedence_parser#Precedence_climbing_method

* https://people.csail.mit.edu/jaffer/slib/Precedence-Parsing.html#Precedence-Parsing

* https://web.archive.org/web/20151223215421/http://hall.org.ua/halls/wizzard/pdf/Vaughan.Pratt.TDOP.pdf (This is pratt's technical paper
  I personally did not read through all of it but it is a valuble resource nontheless)
