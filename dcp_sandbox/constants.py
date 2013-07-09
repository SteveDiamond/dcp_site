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
   "monotonicity": "Increasing for all arguments.",
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
  },
  {"name":"inv_pos",
   "arguments": "Takes a single expression as an argument.",
   "mathematical_definition": 
        ("\operatorname{inv\_pos}(x) = \\begin{cases} 1/x &\mbox{if } x > 0 \\\\ "
         "+\infty & \mbox{if } x \le 0 \end{cases} \\\\"
         "\mbox{ where } x \in \mathbb{R}."),
   "curvature": "Convex",
   "sign": "Positive",
   "monotonicity": "Decreasing",
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
   "monotonicity": "Increasing",
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
   "monotonicity": "Increasing in all arguments.",
   "example": "max(x, y)",
  },
  {"name":"min",
   "arguments": ("Takes a variable number of expressions as arguments. "
                 "These are interpreted as a vector."),
   "mathematical_definition": ("\operatorname{min}(x) = \min \left\{ x_{k} | k \in \{1,...,n \} \\right\}"
                         " \mbox{ where } x \in \mathbb{R}^{n}."),   
   "curvature": "Concave",
   "sign": "The smallest argument sign under the ordering negative < unknown < positive.",
   "monotonicity": "Increasing in all arguments.",
   "example": "min(x, y)",
  },
  {"name":"norm",
   "arguments": ("Takes a variable number of expressions followed by a parameter as arguments. "
                 "The expressions are interpreted as a vector. "
                 "The parameter must be a number p with p >= 1 or Inf. "
                 "The default parameter is 2."),
   "mathematical_definition": ("\operatorname{norm}(x,p) = \\begin{cases} "
                               "\left( \sum_{k=1}^{n} |x_{k}|^{p}} \\right)^{1/p} &\mbox{if } p >= 1 \\\\"
                               "\max \left\{ |x_{k}| | k \in \{1,...,n \} \\right\} &\mbox{if } p = \mbox{Inf} \end{cases} \\\\"
                               " \mbox{ where } x \in \mathbb{R}^{n}."),   
   "curvature": "Convex",
   "sign": "Positive",
   "monotonicity": "Increasing in all arguments.",
   "example": "norm(x, y, 1)",
  },
  {"name":"pos",
   "arguments": "Takes a single expression as an argument.",
   "mathematical_definition": 
        ("\operatorname{pos}(x) = \max \{x,0\}"
         "\mbox{ where } x \in \mathbb{R}."),
   "curvature": "Convex",
   "sign": "Positive",
   "monotonicity": "Increasing",
   "example": "pos(x)",
  },

]
# <li><a href="#abs" data-toggle="modal">abs</a></li>
# <li><a href="#berhu" data-toggle="modal">berhu</a></li>
# <li><a href="#entr" data-toggle="modal">entr</a></li>
# <li><a href="#exp" data-toggle="modal">exp</a></li>
# <li><a href="#geo_mean" data-toggle="modal">geo_mean</a></li>
# <li><a href="#huber" data-toggle="modal">huber</a></li>
# <li><a href="#inv_pos" data-toggle="modal">inv_pos</a></li>
# <li><a href="#kl_div" data-toggle="modal">kl_div</a></li>
# <li><a href="#log" data-toggle="modal">log</a></li>
# <li><a href="#log_sum_exp" data-toggle="modal">log_sum_exp</a></li>
# <li><a href="#max" data-toggle="modal">max</a></li>
# <li><a href="#min" data-toggle="modal">min</a></li>
# <li><a href="#norm" data-toggle="modal">norm</a></li>
# <li><a href="#pos" data-toggle="modal">pos</a></li>

# <li><a href="#pow" data-toggle="modal">pow</a></li>
# <li><a href="#quad_over_lin" data-toggle="modal">quad_over_lin</a></li>
# <li><a href="#sqrt" data-toggle="modal">sqrt</a></li>
# <li><a href="#square" data-toggle="modal">square</a></li>
# <li><a href="#sum" data-toggle="modal">sum</a></li>
# <li><a href="#sum_largest" data-toggle="modal">sum_largest</a></li>
# <li><a href="#sum_smallest" data-toggle="modal">sum_smallest</a></li>