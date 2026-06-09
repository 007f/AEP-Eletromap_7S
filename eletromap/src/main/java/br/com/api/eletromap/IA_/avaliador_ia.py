import sys
import os
import pandas as pd
import joblib

def main():
    try:
        # Pega a pasta exata onde este script Python está salvo
        diretorio_atual = os.path.dirname(os.path.abspath(__file__))

        # Junta o diretório atual com o nome do arquivo do modelo
        MODEL_PATH = os.path.join(diretorio_atual, 'ia_postes_ensemble_v1.pkl')

        # Pega os argumentos passados pelo Java via terminal
        idade = int(sys.argv[1])
        temp = float(sys.argv[2])
        vento = float(sys.argv[3])
        carga = float(sys.argv[4])
        manut = int(sys.argv[5])
        clima = sys.argv[6]

        # 1. Carrega a IA
        ia_carregada = joblib.load(MODEL_PATH)

        # 2. Prepara o DataFrame do poste com as colunas exatas que a IA espera
        poste_atual = pd.DataFrame([{
            'Idade_Anos': idade,
            'Temperatura_C': temp,
            'Velocidade_Vento_kmh': vento,
            'Carga_MW': carga,
            'Dias_Ultima_Manutencao': manut,
            'Condicao_Climatica': clima
        }])

        # 3. Faz a previsão com o modelo oficial
        previsao = ia_carregada.predict(poste_atual)
        resultado = int(previsao[0])

        # Imprime APENAS o número (0 ou 1). O Java vai ler exatamente essa linha.
        print(resultado)

    except Exception as e:
        # Se der erro no Python, imprime no console de erros (stderr) para o Java ver
        print(f"Erro no script Python: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()