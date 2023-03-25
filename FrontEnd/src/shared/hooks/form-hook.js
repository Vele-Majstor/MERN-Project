import {useCallback,useReducer} from "react"


const formValidator = (state, action) => {
    switch (action.type) {
      case "INPUT_CHANGE":
        let formIsValid = true;
        for (const inputId in state.inputs) {
          if (!state.inputs[inputId]){
            continue;
          }
          if (inputId === action.inputId) {
            formIsValid = formIsValid && action.isValid;
          } else {
            formIsValid = formIsValid && state.inputs[inputId].isValid;
          }
        }
        return {
          ...state,
          inputs: {
            ...state.inputs,
            [action.inputId]: { value: action.value, isValid: action.isValid },
          },
          isValid: formIsValid,
        };
        case "SET_FORM_DATA":
          return {
            inputs:action.inputs,
            isValid:action.isValid
          }
      default:
        return state;
    }
  };


  


export const useForm = (initialFormState,initialFormValidity)=>{
    const [formState, dispatch] = useReducer(formValidator, {
        inputs: initialFormState,
        isValid: initialFormValidity,
      });

      const setFormData = useCallback((inputs,formValidity) =>{
        dispatch({type:"SET_FORM_DATA" , inputs:inputs,isValid:formValidity})
      },[])
    
      const inputHandler = useCallback((id, value, isValid) => {
        dispatch({
          type: "INPUT_CHANGE",
          value: value,
          isValid: isValid,
          inputId: id,
        });
      }, []);

      return [formState,inputHandler,setFormData];
}

