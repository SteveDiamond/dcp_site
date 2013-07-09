"""
Constants used by views.py.
"""
# Pre-declared variables and parameters
PREAMBLE = ['variable x y z', 'variable positive u v w',
            'parameter a b c', 'parameter positive d e f']

# All the atoms shown to the user and their definitions.
#TODO move to parser and automate.
ATOM_DEFINITIONS = [
  {"name":"abs",
   "arguments": "Takes a single expression as an argument.",
   "mathematical_definition": "\operatorname{abs}(x) = |x| \mbox{ where } x \in \mathbb{R}.",
   "curvature": "Convex",
   "sign": "Positive",
   "monotonicity": "Increasing for positive arguments. Decreasing for negative arguments.",
   "example": "abs(x)",
  },
  {"name":"berhu",
   "arguments": ("Takes a single expression followed by a parameter as arguments. "
                 "The parameter must be a positive number. "
                 "The default value for the parameter is 1."),
   "mathematical_definition": 
        ("\operatorname{berhu}(x,M) = \\begin{cases} |x| &\mbox{if } |x| \le M \\\\ "
         "\left(|x|^{2} + M^{2} \\right)/2M & \mbox{if } |x| > M \end{cases} \\\\"
         " \mbox{ where } x \in \mathbb{R}."),
   "curvature": "Convex",
   "sign": "Positive",
   "monotonicity": "Increasing for positive arguments. Decreasing for negative arguments.",
   "example": "berhu(x, 1)",
  },
  {"name":"entr",
   "arguments": "Takes a single expression as an argument.",
   "mathematical_definition": 
        ("\operatorname{entr}(x) = \\begin{cases} -x \log (x) &\mbox{if } x > 0 \\\\ "
         "0 & \mbox{if } x = 0 \\\\ "
         "-\infty & \mbox{if } x < 0 \end{cases} \\\\"
         "\mbox{ where } x \in \mathbb{R}."),
   "curvature": "Concave",
   "sign": "Unknown",
   "monotonicity": "Non-monotonic",
   "example": "entr(x)",
  },
  {"name":"exp",
   "arguments": "Takes a single expression as an argument.",
   "mathematical_definition": 
        ("\operatorname{exp}(x) = e^{x} \mbox{ where } x \in \mathbb{R}."),
   "curvature": "Convex",
   "sign": "Positive",
   "monotonicity": "Increasing",
   "example": "exp(x)",
  },
  {"name":"geo_mean",
   "arguments": ("Takes a variable number of expressions as arguments. "
                 "These are interpreted as a vector."),
   "mathematical_definition": 
        ("\operatorname{geo\_mean}(x) = \\begin{cases} "
         "\left( \prod_{k=1}^{n} x_{k} \\right)^{1/n} &\mbox{if } x \succeq 0 \\\\ "
         "-\infty & \mbox{otherwise } \end{cases} \\\\"
         "\mbox{ where } x \in \mathbb{R}^{n}."),
   "curvature": "Concave",
   "sign": "Negative if any argument is negative. Otherwise positive.",
   "monotonicity": "Non-decreasing for all arguments.",
   "example": "geo_mean(x, y)",
  },
  {"name":"huber",
   "arguments": ("Takes a single expression followed by a parameter as arguments. "
                 "The parameter must be a positive number. "
                 "The default value for the parameter is 1."),
   "mathematical_definition": 
        ("\operatorname{huber}(x,M) = \\begin{cases} 2M|x|-M^{2} &\mbox{if } |x| \ge M \\\\ "
         " |x|^{2} & \mbox{if } |x| < M \end{cases} \\\\"
         " \mbox{ where } x \in \mathbb{R}."),
   "curvature": "Convex",
   "sign": "Positive",
   "monotonicity": "Increasing for positive arguments. Decreasing for negative arguments.",
   "example": "huber(x, 1)",
   "cvx_equivalent": "huber, huber_pos, huber_circ",
  },
  {"name":"inv_pos",
   "arguments": "Takes a single expression as an argument.",
   "mathematical_definition": 
        ("\operatorname{inv\_pos}(x) = \\begin{cases} 1/x &\mbox{if } x > 0 \\\\ "
         "+\infty & \mbox{if } x \le 0 \end{cases} \\\\"
         "\mbox{ where } x \in \mathbb{R}."),
   "curvature": "Convex",
   "sign": "Positive",
   "monotonicity": "Non-increasing",
   "example": "inv_pos(x)",
  },
  {"name":"kl_div",
   "arguments": "Takes two expressions as arguments.",
   "mathematical_definition": 
        ("\operatorname{kl\_div}(x,y) = \\begin{cases} x \log (x/y)-x+y &\mbox{if } x,y > 0 \\\\ "
         "0 & \mbox{if } x = 0 \mbox{ and } y=0 \\\\"
         "+\infty & \mbox{otherwise } \end{cases} \\\\"
         "\mbox{ where } x,y \in \mathbb{R}."),
   "curvature": "Convex",
   "sign": "Unknown",
   "monotonicity": "Non-monotonic in all arguments.",
   "example": "kl_div(x, y)",
  },
  {"name":"log",
   "arguments": "Takes a single expression as an argument.",
   "mathematical_definition": 
        ("\operatorname{log}(x) = \\begin{cases} \log (x) &\mbox{if } x > 0 \\\\ "
         "-\infty & \mbox{if } x \le 0 \end{cases} \\\\"
         "\mbox{ where } x \in \mathbb{R}."),
   "curvature": "Concave",
   "sign": "Unknown",
   "monotonicity": "Non-decreasing",
   "example": "log(x)",
  },
  {"name":"log_sum_exp",
   "arguments": ("Takes a variable number of expressions as arguments. "
                 "These are interpreted as a vector."),
   "mathematical_definition": ("\operatorname{log\_sum\_exp}(x) = \log \left( \sum_{k=1}^{n} e^{x_{k}} \\right)"
                               " \mbox{ where } x \in \mathbb{R}^{n}."),
   "curvature": "Convex",
   "sign": "Unknown",
   "monotonicity": "Increasing in all arguments.",
   "example": "log_sum_exp(x, y)",
  },
  {"name":"max",
   "arguments": ("Takes a variable number of expressions as arguments. "
                 "These are interpreted as a vector."),
   "mathematical_definition": ("\operatorname{max}(x) = \max \left\{ x_{k} | k \in \{1,...,n \} \\right\}"
                         " \mbox{ where } x \in \mathbb{R}^{n}."),   
   "curvature": "Convex",
   "sign": "The largest argument sign under the ordering negative < unknown < positive.",
   "monotonicity": "Non-decreasing in all arguments.",
   "example": "max(x, y)",
  },
  {"name":"min",
   "arguments": ("Takes a variable number of expressions as arguments. "
                 "These are interpreted as a vector."),
   "mathematical_definition": ("\operatorname{min}(x) = \min \left\{ x_{k} | k \in \{1,...,n \} \\right\}"
                         " \mbox{ where } x \in \mathbb{R}^{n}."),   
   "curvature": "Concave",
   "sign": "The smallest argument sign under the ordering negative < unknown < positive.",
   "monotonicity": "Non-decreasing in all arguments.",
   "example": "min(x, y)",
  },
  {"name":"norm",
   "arguments": ("Takes a variable number of expressions followed by a parameter as arguments. "
                 "The expressions are interpreted as a vector. "
                 "The parameter must either be a number p with p >= 1 or be Inf. "
                 "The default parameter is 2."),
   "mathematical_definition": ("\\begin{aligned} "
                               " \operatorname{norm}(x,p) &= \left( \sum_{k=1}^{n} |x_{k}|^{p}} \\right)^{1/p} \\\\"
                               " \operatorname{norm}(x,\mbox{Inf}) &= \max \left\{ \left| x_{k} \\right| | k \in \{1,...,n \} \\right\} \\\\"
                               " \mbox{ where } x \in \mathbb{R}^{n}."
                               " \end{aligned} "),
   "curvature": "Convex",
   "sign": "Positive",
   "monotonicity": "Non-decreasing in all arguments.",
   "example": "norm(x, y, 1)",
  },
  {"name":"pos",
   "arguments": "Takes a single expression as an argument.",
   "mathematical_definition": 
        ("\operatorname{pos}(x) = \max \{x,0\}"
         "\mbox{ where } x \in \mathbb{R}."),
   "curvature": "Convex",
   "sign": "Positive",
   "monotonicity": "Non-decreasing",
   "example": "pos(x)",
  },
  {"name":"quad_over_lin",
   "arguments": "Takes two expressions as arguments.",
   "mathematical_definition": 
        ("\operatorname{quad\_over\_lin}(x,y) = \\begin{cases} x^{2}/y &\mbox{if } y > 0 \\\\ "
         "+\infty & \mbox{if } y <= 0 \end{cases} \\\\"
         "\mbox{ where } x,y \in \mathbb{R}."),
   "curvature": "Convex",
   "sign": "Positive",
   "monotonicity": ("Increasing in the first argument if the argument is positive. "
                    "Decreasing if the argument is negative. "
                    "Non-increasing in the second argument."),
   "example": "quad_over_lin(x, y)",
  },
  {"name":"sqrt",
   "arguments": "Takes a single expression as an argument.",
   "mathematical_definition": 
        ("\operatorname{sqrt}(x) = \\begin{cases} \sqrt{x} &\mbox{if } x \ge 0 \\\\ "
         "-\infty & \mbox{if } x < 0 \end{cases} \\\\"
         "\mbox{ where } x \in \mathbb{R}."),
   "curvature": "Concave",
   "sign": "Negative if the argument is negative. Otherwise positive.",
   "monotonicity": "Non-decreasing",
   "example": "sqrt(x)",
  },
  {"name":"square",
   "arguments": "Takes a single expression as an argument.",
   "mathematical_definition": "\operatorname{square}(x) = x^{2} \mbox{ where } x \in \mathbb{R}.",
   "curvature": "Convex",
   "sign": "Positive",
   "monotonicity": "Increasing for positive arguments. Decreasing for negative arguments.",
   "example": "square(x)",
   "cvx_equivalent": "square, square_pos, square_abs",
  },
  {"name":"pow",
   "arguments": ("Takes a single expression followed by a parameter as arguments. "
                 "The parameter must be a number. "),
   "mathematical_definition":
        ("\\begin{aligned} "
        " p &\le 0: \operatorname{pow}(x,p) &= "
        "\\begin{cases} x^{p} &\mbox{if } x > 0 \\\\"
        " +\infty &\mbox{if } x \le 0 \end{cases} \\\\"
        " 0 < p &< 1: \operatorname{pow}(x,p) &= "
        "\\begin{cases} x^{p} &\mbox{if } x \ge 0 \\\\"
        " -\infty &\mbox{if } x < 0 \end{cases}\\\\"
        " p &\ge 1: \operatorname{pow}(x,p) &= "
        "\\begin{cases} x^{p} &\mbox{if } x \ge 0 \\\\"
        " +\infty &\mbox{if } x < 0 \end{cases}\\\\"
        " \mbox{ where } x \in \mathbb{R}^{n}."
        " \end{aligned} "),
   "curvature": "Concave for 0 < p < 1. Otherwise convex.",
   "sign": "The argument's sign for 0 < p < 1. Otherwise positive.",
   "monotonicity": ("Non-increasing for p <= 0. Non-decreasing for 0 < p < 1. "
                    "If p >= 1, increasing for positive arguments and non-increasing for negative arguments."),
   "example": "pow(x, 3)",
   "cvx_equivalent": "pow_p",
  },
]

# TODO add these functions?
# <li><a href="#sum_largest" data-toggle="modal">sum_largest</a></li>
# <li><a href="#sum_smallest" data-toggle="modal">sum_smallest</a></li>