<scxml initial="s0" version="1.0">
  <datamodel>
    <data id="Var1" expr={ 0 }/>
  </datamodel>

  <state id="s0">
    <onexit>
      <assign location="Var1" expr={ ({ Var1 }) => Var1 + 1 }/>
    </onexit>
    <transition target="s1"/>
  </state>

  <state id="s1">
    <transition cond={ ({ Var1 }) => Var1 == 1 } target="pass"/>
    <transition target="fail"/>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
