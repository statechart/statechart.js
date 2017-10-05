<scxml version="1.0" initial="s1">
  <datamodel>
    <data id="Var1" expr={ 0 }/>
  </datamodel>

  <state id="s1" initial="s11">
    <onentry>
      <send event="timeout" delay={ () => '2s' }/>
    </onentry>
    <transition event="invokeS1 invokeS12">
      <assign location="Var1" expr={ ({ Var1 }) => Var1 + 1 }/>
    </transition>
    <transition event="invokeS11" target="fail"/>

    <transition event="timeout" cond={ ({ Var1 }) => Var1 == 2 } target="pass"/>
    <transition event="timeout" target="fail"/>
    <invoke>
      <content>
        <scxml initial="sub0" version="1.0" datamodel="ecmascript">
          <state id="sub0">
            <onentry>
              <send target="#_parent" event="invokeS1"/>
            </onentry>
            <transition target="subFinal0"/>
          </state>
          <final id="subFinal0"/>
        </scxml>
      </content>
    </invoke>

    <state id="s11">
      <invoke>
        <content>
          <scxml initial="sub1" version="1.0" datamodel="ecmascript">
            <state id="sub1">
              <onentry>
                <send target="#_parent" event="invokeS11"/>
              </onentry>
              <transition target="subFinal1"/>
            </state>
            <final id="subFinal1"/>
          </scxml>
        </content>
      </invoke>
      <transition target="s12"/>
    </state>
    <state id="s12">
      <invoke>
        <content>
          <scxml initial="sub2" version="1.0" datamodel="ecmascript">
            <state id="sub2">
              <onentry>
                <send target="#_parent" event="invokeS12"/>
              </onentry>
              <transition target="subFinal2"/>
            </state>
            <final id="subFinal2"/>
          </scxml>
        </content>
      </invoke>
    </state>
  </state>

  <final id="pass"></final>
  <final id="fail"></final>
</scxml>
