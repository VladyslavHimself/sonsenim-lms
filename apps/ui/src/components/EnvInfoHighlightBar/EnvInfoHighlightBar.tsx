
export function EnvInfoHighlightBar() {
    console.log(process.env.APP_ENV)
    return (
        <div style={{
            position: 'fixed',
            bottom: '0%',
            left: 0,
            backgroundColor: 'green',
            height: '25px',
            width: '100vw',

            fontFamily: 'Gilroy, sans-serif',
            fontSize: '16px',
            color: 'white',
            padding: '5px 15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
           STAGE ENVIRONMENT. Commit № {"<commmit-number>"}
        </div>
    );
};