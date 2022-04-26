import styled from "styled-components";

const FormPageContent = styled.div<{ big?: boolean }>`
  max-width: ${({ big }) => (big ? 1480 : 813)}px;
  margin: 13px auto;
  height: calc(100% - 26px);
`;

export default FormPageContent;
