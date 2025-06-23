import random

# Tic-Tac-Toe Game with AI
def print_board(board):
    print()
    print(f' {board[0]} | {board[1]} | {board[2]} ')
    print('---+---+---')
    print(f' {board[3]} | {board[4]} | {board[5]} ')
    print('---+---+---')
    print(f' {board[6]} | {board[7]} | {board[8]} ')
    print()

def check_win(board, player):
    win_conditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ]
    for condition in win_conditions:
        if all(board[i] == player for i in condition):
            return True
    return False

def check_draw(board):
    return all(space in ['X', 'O'] for space in board)

def player_move(board):
    while True:
        move = input('Enter your move (1-9): ')
        if move.isdigit():
            move = int(move) - 1
            if 0 <= move <= 8 and board[move] not in ['X', 'O']:
                board[move] = 'X'
                break
            else:
                print('Invalid move, space is occupied or out of range.')
        else:
            print('Please enter a number between 1 and 9.')

def ai_move(board):
    # Simple AI to choose a winning move or block player's winning move, else random
    for player in ['O', 'X']:
        for i in range(9):
            if board[i] not in ['X', 'O']:
                temp = board[i]
                board[i] = player
                if check_win(board, player):
                    if player == 'O':
                        return
                    else:
                        board[i] = 'O'
                        return
                board[i] = temp
    # Otherwise random move
    available = [i for i in range(9) if board[i] not in ['X', 'O']]
    move = random.choice(available)
    board[move] = 'O'

def main():
    print('Welcome to Tic-Tac-Toe!')
    print('You are X and the AI is O.')
    print('Enter numbers 1-9 to make your move as below:')
    print(' 1 | 2 | 3 ')
    print('---+---+---')
    print(' 4 | 5 | 6 ')
    print('---+---+---')
    print(' 7 | 8 | 9 ')

    board = [str(i + 1) for i in range(9)]
    print_board(board)

    while True:
        player_move(board)
        print_board(board)
        if check_win(board, 'X'):
            print('Congratulations! You win!')
            break
        if check_draw(board):
            print('It is a draw!')
            break
        print('AI is making a move...')
        ai_move(board)
        print_board(board)
        if check_win(board, 'O'):
            print('AI wins! Better luck next time!')
            break
        if check_draw(board):
            print('It is a draw!')
            break

if __name__ == '__main__':
    main()