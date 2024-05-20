/*import React, { useState } from 'react';

function App() {
    const [countryList, setCountryList] = useState([]);
    const countryCollenctionRef = collection(db, "Country");

    useEffect(() => {
        const getCountryList = async () => {
            try {
                const data = await getDocs(countyCollectionRef);
                const filterderData = data.docs.map((doc) => ({...doc.data()}));
                setCountryList(filteredData);
            } catch (error){
                setError(error.message);
            }
        };
        getCountryList();
    }, []);

    return (
        <div className="App">
            <div>
                {countryList.map((country) => (
                <p> {county.name}</p>
                ))}
            </div>
        </div>
    )
}

export default App;*/

export const Activities = () => {
    return <div> Activities! </div>;
};