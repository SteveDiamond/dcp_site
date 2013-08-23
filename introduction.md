Disciplined Convex Programming at Stanford
==========================================

This website is designed to teach disciplined convex programming (DCP). DCP is a system for constructing convex optimization problems. The DCP rules guarantee that any problem constructed using DCP can be solved with convex optimization. DCP is used by [CVX](http://cvxr.com/cvx/) and [CVXPY](https://github.com/cvxgrp/cvxpy). 

This introduction covers the rules of DCP. After reading the introduction, visit the [DCP Quiz](http://dcp.stanford.edu/quiz) to practice applying the DCP rules to mathematical expressions. A [DCP Analyzer](http://dcp.stanford.edu/analyzer) is also available where you can enter expressions, equalities, and inequalities and see a visualization of the DCP analysis.

Expressions
------------
In DCP, mathematical expressions are viewed as parse trees. The leaves of the parse tree are variables and constants. Parent nodes represent the application of an arithmetic operator or function to the child nodes. Hence, the root node represents the overall expression while each parent node represents a subexpression. Consider the expression `-2*x + 3`. The tree visualization below shows the DCP analysis of the expression.

TODO screenshot from analyzer

Each node in the tree has a sign and curvature. The signs and curvatures of the leaf nodes are determined by their type. Variables are affine and have unknown sign. Constants are positive or negative depending on their numeric value and their curvature is constant.

The signs and curvatures of parent nodes are determined from the signs and curvatures of their children. The table below summarizes 

The DCP rule
------------
Disciplined convex programming (DCP) is a framework for verifying the
convexity (concavity) of a mathematical expression. It uses the following
basic rule:

    f(h1(x), h2(x), ..., hn(x)) is convex when f is convex and
    * f is increasing in argument i and hi is convex
    * f is decreasing in argument i and hi is concave
    * hi is affine

Assuming that `f` and `hi` are continuously differentiable, this rule can be
verified from elementary calculus. A similar rule exists for verifying
concavity of an expression.

Constructive convex analysis
----------------------------
In convex optimization, the key building blocks are convex and concave
expressions. There are many systems for verifying the convexity and concavity
of expressions, and DCP is one of them.

DCP differs from other systems in that it is _constructive_ and uses _local_
information. This means that expressions must be formed from a fixed set of
atoms with known curvatures (roughly, the sign of the second derivative) and
argument monotonicities (roughly, the sign of the first derivative). This also
implies that DCP rules are sufficient but not necessary for verifying
convexity. For instance, the expression

    sqrt(1 + x^2)

is convex, but is not verifiable by DCP rules. Instead, it is better to
express it as

    norm([1; x]).

In what follows, we shall describe how DCP works with this example.


Variables, parameters, and constants
------------------------------------
Expressions are formed from variables, parameters, and constants. These have
the following properties:

* Variables have affine curvature
* Parameters have constant curvature with (possibly) known sign and
unknown values
* Constants have constant curvature and have known values

An affine expression is constructed by composing variables, parameters, and
constants with the standard infix operators, `+`, `-`, `*`, and `/`. Note that
special care must be handled with `*` and `/`. In particular, one of the two
arguments to these binary operators must have constant curvature.

Atoms
-----
In addition to creating expressions from standard mathematical operators, we
also provide a set of atoms whith known curvature and monotonicities. For
instance, the `sqrt` atom is concave and increasing in its argument. We give
a list of the provided atoms and their properties [here](http://google.com).

When an atom is composed with an expression, we determine whether the result is convex,
concave, or affine using the DCP rules. This uses only local information from
the expression and not any global information (such as the nonnegativity of
an expression, etc.).

Sign, monotonicity, and curvature
---------------------------------
The sign of an expression depends on the sign of its components. For instance,
the sum of two positive expressions is positive, etc.

The monotonicity of a function depends on the argument sign. For instance,
the `square` atom is usually nonmonotone in its argument. However, when the
argument is positive, it is increasing; when the argument is negative, it is
decreasing.

The curvature of an expression follows from the DCP rules and the basic rules

    convex + convex = convex
    concave + concave = concave
    affine + affine = affine
    constant + constant = constant
    positive constant * convex = convex
    negative constant * convex = concave
    positive constant * concave = concave
    negative constant * concave = convex


Example
-------
As an example, we'll walk through the application of the DCP rule when applied
to the expression `sqrt(1 + x^2)`.

The variable `x` has affine curvature, and the constant `1` has constant
curvature. The square operator is convex and nonmonotone, so it can take
the affine expression `x` as an argument; the result `x^2` is convex.

The convex expression `x^2` plus the constant `1` is also also convex. The
atom `sqrt` is concave and increasing, which means it can only take a concave
argument. Since `1 + x^2` is convex, `sqrt(1+x^2)` violates the DCP rule and
cannot be verified as convex.

However, the `norm` atom is nonmonotone in its first argument. The
concatenation operator is affine, so the expression `[1; x]` is affine.
Therefore, the expression `norm([1; x])` is convex (as determined by the DCP
rule).

Mathematically, `norm([1; x]) = sqrt(1 + x^2)`, but only the first is
verifiably convex from local information, while the latter violates the DCP
rule.


Exercises
---------
The goal of this website is to present expressions to test your knowledge and
improve your proficiency with the DCP rules. The solutions present the
expression tree with each node annotated with its sign and resulting
curvature.

On a separate page, you can form expressions using the set of atoms provided
and examine the resulting expression tree.

About
--------
This website was created by Steven Diamond in 2013 to complement material from Stanford University's convex optimization course, [EE364a](http://www.stanford.edu/class/ee364a).