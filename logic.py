from automata.pda.npda import NPDA

automata_pila = NPDA(
    states={'p', 'q', 'r'},
    input_symbols={'a', 'b', 'c'},
    stack_symbols={'A', 'B', '#'},
    transitions={
        'p': {
            'a': {
                '#': {('p', ('A', '#'))},
                'A': {('p', ('A', 'A'))},
                'B': {('p', ('A', 'B'))}
            },
            'b': {
                '#': {('p', ('B', '#'))},
                'A': {('p', ('B', 'A'))},
                'B': {('p', ('B', 'B'))}
            },
            'c': {
                '#': {('q', ('#'))},
                'A': {('q', ('A'))},
                'B': {('q', ('B'))}
            }
        },
        'q': {
            'a': {'A': {('q', (''))}},
            'b': {'B': {('q', (''))}},
            '': {'#': {('r', ('#'))}}
        }
    },
    initial_state='p',
    initial_stack_symbol='#',
    final_states={'r'},
    acceptance_mode='final_state'
)